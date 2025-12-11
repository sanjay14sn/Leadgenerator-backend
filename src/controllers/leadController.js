import fetch from "node-fetch";
import Lead from "../models/Lead.js";
import { generateCSV } from "../utils/csvExporter.js";
import { findInstagram } from "../utils/instagramFinder.js";



/* ----------------------------------------------------
   WHATSAPP CHECKER (Google Redirect Check)
---------------------------------------------------- */
async function checkWhatsApp(phone) {
  if (!phone) return false;

  const clean = phone.replace(/\D/g, "");
  const url = `https://api.whatsapp.com/send/?phone=${clean}&text&type=phone_number&app_absent=0`;

  try {
    const res = await fetch(url, { method: "GET", redirect: "manual" });
    return res.status === 302 || res.status === 200;
  } catch (err) {
    console.error("WhatsApp check failed:", err.message);
    return false;
  }
}

/* ----------------------------------------------------
   JUSTDIAL WHATSAPP FALLBACK CHECK
---------------------------------------------------- */
async function checkJustDialWhatsApp(businessName, city = "Chennai") {
  try {
    const url = `https://www.justdial.com/api/india_api_search.php?query=${encodeURIComponent(
      businessName + " " + city
    )}`;

    const res = await fetch(url);

    // JD sometimes returns HTML -> avoid crashing JSON.parse
    const text = await res.text();
    try {
      const data = JSON.parse(text);

      if (!data.results || data.results.length === 0) {
        return { found: false, number: "" };
      }

      const jd = data.results[0];
      return {
        found: !!jd.contacts?.whatsapp,
        number: jd.contacts?.whatsapp || "",
      };
    } catch {
      // not valid JSON, just ignore
      console.log("JD WhatsApp error: non-JSON response");
      return { found: false, number: "" };
    }
  } catch (err) {
    console.log("JD WhatsApp error:", err.message);
    return { found: false, number: "" };
  }
}

/* ----------------------------------------------------
   LEAD SCORING
---------------------------------------------------- */
function scoreLead(lead) {
  let score = 0;

  if (lead.whatsapp) score += 40;
  if (lead.jd_whatsapp_exists) score += 30;
  if (!lead.website) score += 40;

  if (lead.rating >= 4.5) score += 10;
  if (lead.reviews >= 50) score += 10;

  return score;
}

/* ----------------------------------------------------
   SCRAPE GOOGLE MAPS
---------------------------------------------------- */
export const scrapeLeads = async (req, res) => {
  try {
    const { keyword, location } = req.body;

    const url = `https://www.searchapi.io/api/v1/search?engine=google_maps&q=${encodeURIComponent(
      keyword + " in " + location
    )}&api_key=${process.env.SERP_API}`;

    const response = await fetch(url);
    const data = await response.json();
    const results = data.local_results || [];

    const leads = [];
    const seenPhones = new Set();

    for (const i of results) {
      const phone = i.phone || "";
      if (!phone || seenPhones.has(phone)) continue;
      seenPhones.add(phone);

      const hasWhatsapp = await checkWhatsApp(phone);

      let jdWhatsapp = { found: false, number: "" };
      if (!hasWhatsapp) jdWhatsapp = await checkJustDialWhatsApp(i.title, location);

      const images = i.photos?.map((p) => p.src) || [];
      const thumbnail = i.thumbnail || images[0] || "";

      /* Instagram AI – fail soft */
      let aiIG = { exact: "", suggestions: [] };
      try {
        aiIG = await findInstagram({
          name: i.title,
          address: i.address,
          category: i.type,
          city: location,
          phone,
          gmap: i.reviews_link,
        });
      } catch (err) {
        console.log("Instagram AI error:", err.message);
      }

      const lead = {
        name: i.title || "",
        phone,
        address: i.address || "",
        website: i.website || "",
        hasWebsite: !!i.website,
        category: i.type || "",
        tags: i.types || [],

        rating: i.rating || 0,
        reviews: i.reviews || 0,
        rating_breakdown: i.reviews_per_rating || {},
        review_snippet: i.reviews?.[0]?.snippet || "",

        gmap_link: i.reviews_link || "",
        lat: i.gps_coordinates?.latitude || null,
        lng: i.gps_coordinates?.longitude || null,

        static_map:
          i.gps_coordinates
            ? `https://maps.googleapis.com/maps/api/staticmap?center=${i.gps_coordinates.latitude},${i.gps_coordinates.longitude}&zoom=15&size=600x300&markers=color:red|${i.gps_coordinates.latitude},${i.gps_coordinates.longitude}`
            : "",

        images,
        thumbnail,

        description: i.description || "",
        hours: i.hours?.weekday_text || [],
        open_now_text: i.hours?.status || "",
        verified: i.claimed,

        whatsapp: hasWhatsapp,
        jd_whatsapp_exists: jdWhatsapp.found,
        jd_whatsapp_number: jdWhatsapp.number,

        keyword,
        instagram_exact: aiIG.exact || "",
        instagram_suggestions: aiIG.suggestions || [],
        lead_score: 0,
      };

      lead.lead_score = scoreLead(lead);
      leads.push(lead);
    }

    /* ---------------- BULK UPSERT (FIXED) ---------------- */
    if (leads.length > 0) {
      const ops = leads.map((l) => {
        // avoid conflict: don't set "name" in both $setOnInsert and $set
        const {
          name,
          phone,
          createdAt, // ignore if present
          ...rest
        } = l;

        return {
          updateOne: {
            filter: { phone: l.phone },
            update: {
              $setOnInsert: {
                name: l.name,
                phone: l.phone,
                createdAt: new Date(),
              },
              $set: rest,
            },
            upsert: true,
          },
        };
      });

      await Lead.bulkWrite(ops, { ordered: false });
    }

    res.json({ message: "Scrape complete", saved: leads.length, leads });
  } catch (err) {
    console.error("SCRAPE ERROR:", err);
    res.status(500).json({ error: "Scraping error" });
  }
};

/* ----------------------------------------------------
   GET ONE LEAD
---------------------------------------------------- */
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ----------------------------------------------------
   UPDATE LEAD + AUTO DROP WEBSITE
---------------------------------------------------- */
export const updateLead = async (req, res) => {
  try {
    // 🔧 FIX CastError: if images is array of objects, move to generated_images
    if (
      Array.isArray(req.body.images) &&
      req.body.images.length > 0 &&
      typeof req.body.images[0] === "object"
    ) {
      req.body.generated_images = req.body.images;
      delete req.body.images; // images[] in schema is [String]
    }

    const updated = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    /* ---------- AUTO GENERATE SIMPLE STATIC HTML ---------- */
    const html = `
      <html>
        <head>
          <title>${updated.name}</title>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; max-width: 900px; margin: 0 auto; }
            img { max-width: 100%; border-radius: 12px; }
            h1 { font-size: 32px; margin-bottom: 8px; }
            h2 { margin-top: 32px; }
          </style>
        </head>
        <body>
          <h1>${updated.hero_title || updated.name}</h1>
          <p>${updated.hero_subtitle || ""}</p>

          ${
            updated.thumbnail
              ? `<img src="${updated.thumbnail}" alt="Business image" />`
              : ""
          }

          <h2>About</h2>
          <p>${updated.description || ""}</p>

          <h2>Contact</h2>
          <p><strong>Phone:</strong> ${updated.phone || ""}</p>
          <p><strong>Address:</strong> ${updated.address || ""}</p>

          <footer style="margin-top: 40px; opacity: .6;">
            Powered by LeadGen Websites
          </footer>
        </body>
      </html>
    `;

    /* ---------- UPLOAD TO NETLIFY DROP (NO AUTH) ---------- */
    const uploadRes = await fetch("https://api.netlify.com/api/v1/drop", {
      method: "POST",
      headers: { "Content-Type": "text/html" },
      body: html,
    });

    let webUrl = "";
    try {
      const data = await uploadRes.json();
      webUrl = data.url || "";
    } catch {
      console.log("Netlify drop did not return JSON");
    }

    if (webUrl) {
      updated.web_url = webUrl;
      updated.last_published = new Date();
      await updated.save();
    }

    res.json({ updated, web_url: webUrl });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ----------------------------------------------------
   GET ALL LEADS
---------------------------------------------------- */
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: "Failed to load leads" });
  }
};

/* ----------------------------------------------------
   CSV EXPORT
---------------------------------------------------- */
export const exportCSV = async (req, res) => {
  try {
    const leads = await Lead.find({});
    const csv = generateCSV(leads);

    res.header("Content-Type", "text/csv");
    res.attachment("leads.csv");

    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "CSV export failed" });
  }
};
