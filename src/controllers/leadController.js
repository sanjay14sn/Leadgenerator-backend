// src/controllers/leadController.js

import fetch from "node-fetch";
import Lead from "../models/Lead.js";
import { generateCSV } from "../utils/csvExporter.js";
import { findInstagram } from "../utils/instagramFinder.js";

/* ----------------------------------------------------
   HELPERS (Unchanged)
---------------------------------------------------- */

// WHATSAPP CHECKER
async function checkWhatsApp(phone) {
  // ... (implementation unchanged)
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

// JUSTDIAL WHATSAPP CHECK
async function checkJustDialWhatsApp(businessName, city = "Chennai") {
  // ... (implementation unchanged)
  try {
    const url = `https://www.justdial.com/api/india_api_search.php?query=${encodeURIComponent(
      businessName + " " + city
    )}`;

    const res = await fetch(url);

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (!data.results?.length) return { found: false, number: "" };

      const jd = data.results[0];
      return {
        found: !!jd.contacts?.whatsapp,
        number: jd.contacts?.whatsapp || "",
      };
    } catch {
      console.log("JD WhatsApp error: non-JSON response");
      return { found: false, number: "" };
    }
  } catch (err) {
    console.log("JD WhatsApp error:", err.message);
    return { found: false, number: "" };
  }
}

// LEAD SCORING
function scoreLead(lead) {
  // ... (implementation unchanged)
  let score = 0;

  if (lead.whatsapp) score += 40;
  if (lead.jd_whatsapp_exists) score += 30;
  if (!lead.website) score += 40;

  if (lead.rating >= 4.5) score += 10;
  if (lead.reviews >= 50) score += 10;

  return score;
}

/* ----------------------------------------------------
   FOLLOW-UP ACTIONS (Unchanged)
---------------------------------------------------- */
export const logWhatsAppSent = async (req, res) => {
  // ... (implementation unchanged)
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Initialize followup if it doesn't exist
    if (!lead.followup) lead.followup = {};

    lead.followup.whatsapp_sent_count =
      (lead.followup.whatsapp_sent_count || 0) + 1;
    lead.followup.last_whatsapp_sent = new Date();

    lead.followup.history.push({
      action: "WHATSAPP_SENT",
      message: "Demo website sent on WhatsApp",
    });

    await lead.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "WhatsApp log failed" });
  }
};

export const trackWhatsAppRedirect = async (req, res) => {
  // ... (implementation unchanged)
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).send("Lead not found");

    // Add delivered status
    lead.followup.history.push({
      action: "WHATSAPP_DELIVERED",
      message: "Lead clicked WhatsApp message link",
    });

    await lead.save();

    const phone = lead.phone.replace(/\D/g, "");
    const msg = encodeURIComponent("Mam/Sir, here is your sample website.");

    // Redirect to the actual WhatsApp chat link
    return res.redirect(`https://wa.me/${phone}?text=${msg}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Redirect failed");
  }
};

export const trackWebsiteOpen = async (req, res) => {
  // ... (implementation unchanged)
  try {
    const lead = await Lead.findById(req.params.id);

    if (lead) {
      lead.followup.history.push({
        action: "OPENED_WEBSITE",
        message: "Lead opened the demo website",
      });
      await lead.save();
    }

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
};

export const updateFollowupStatus = async (req, res) => {
  // ... (implementation unchanged)
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      id,
      { "followup.status": status },
      { new: true }
    );

    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: "Status update failed" });
  }
};

// PRO MAX Fetch Wrapper (Retries + Timeout + Proxy Safe)
async function safeFetch(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 sec timeout

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.log(`🔁 Fetch Retry ${i + 1}/${retries} failed → ${err.message}`);
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}


/* ----------------------------------------------------
   NEW: SIMPLE LEAD DATA UPDATE (For Notes/Basic Fields)
---------------------------------------------------- */
// This is the controller the frontend's addNote function will now hit.
export const updateLeadData = async (req, res) => {
  // ... (implementation unchanged)
  try {
    // We explicitly exclude fields that trigger website builder/publishing
    const {
      hero_title,
      hero_subtitle,
      cta_title,
      cta_button,
      testimonials,
      generated_images,
      images,
      ...updatePayload
    } = req.body;

    const updated = await Lead.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Lead not found" });

    res.json(updated);
  } catch (err) {
    console.error("SIMPLE UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ----------------------------------------------------
   WEBSITE PUBLISH LEAD UPDATE (Original Logic)
---------------------------------------------------- */
// Renamed the original updateLead to updateLeadAndPublish to reflect its purpose
export const updateLeadAndPublish = async (req, res) => {
  // ... (implementation unchanged)
  try {
    const update = { ...req.body };

    // Logic to handle image conversion for the website builder
    if (
      Array.isArray(req.body.images) &&
      typeof req.body.images[0] === "object"
    ) {
      update.generated_images = req.body.images;
      delete update.images;
    }

    const updated = await Lead.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Lead not found" });

    // --- WEBSITE PUBLISHING LOGIC ---
    const pixel = `<img src="https://yourapi.com/open/${updated._id}" width="1" height="1" />`;

    const html = `
      <html>
        <head>
          <title>${updated.name}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>body{font-family:sans-serif;padding:24px;}</style>
        </head>
        <body>
          ${pixel}
          <h1>${updated.hero_title || updated.name}</h1>
          <p>${updated.hero_subtitle || ""}</p>
          ${updated.thumbnail ? `<img src="${updated.thumbnail}" />` : ""}
          <h2>About</h2>
          <p>${updated.description || ""}</p>
        </body>
      </html>
    `;

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
      console.error("Netlify upload failed, possibly non-JSON response.");
    }

    if (webUrl) {
      updated.web_url = webUrl;
      updated.last_published = new Date();
      await updated.save();
    }

    // Returning the newly published URL and the updated lead data
    res.json({ updated, web_url: webUrl });
  } catch (err) {
    console.error("UPDATE & PUBLISH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ----------------------------------------------------
   LEAD SCRAPE (REVISED)
---------------------------------------------------- */
export const scrapeLeads = async (req, res) => {
  try {
    const { keyword, location } = req.body;

    console.log("🔥 SCRAPER STARTED:", keyword, location);

    /* ----------------------------------------------------
       SEARCHAPI GOOGLE MAPS SCRAPE (PRO MAX MODE)
    ---------------------------------------------------- */
    const url = `https://www.searchapi.io/api/v1/search?engine=google_maps&q=${encodeURIComponent(
      keyword + " in " + location
    )}&api_key=${process.env.SERP_API}&proxy=true&proxy_type=residential&country=IN&domain=google.co.in&device=desktop`;

    console.log("🌍 FETCHING MAP RESULTS...");

    const data = await safeFetch(url);

    const results = data.local_results || [];
    const leads = [];
    const seenPhones = new Set();

    for (const i of results) {
      const phone = i.phone || "";
      if (!phone || seenPhones.has(phone)) continue;
      seenPhones.add(phone);

      // 🔎 WhatsApp Check
      const hasWhatsapp = await checkWhatsApp(phone);

      // 🔎 JustDial Backup WhatsApp Check
      let jdWhatsapp = { found: false, number: "" };
      if (!hasWhatsapp)
        jdWhatsapp = await checkJustDialWhatsApp(i.title, location);

      const images = i.photos?.map((p) => p.src) || [];
      const thumbnail = i.thumbnail || images[0] || "";

      // 🔎 Instagram AI Finder
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
      } catch {}

      /* ----------------------------------------------------
         GOOGLE RANK TRACKING (PRO MAX MODE)
      ---------------------------------------------------- */
      let googleRankPosition = null;
      let googleRankResults = [];
      let googleTopCompetitors = [];

      try {
        const searchKeyword = `${i.title} ${location}`;
        const rankUrl = `https://www.searchapi.io/api/v1/search?engine=google_rank_tracking&q=${encodeURIComponent(
          searchKeyword
        )}&api_key=${process.env.SERP_API}&proxy=true&proxy_type=residential&country=IN&domain=google.co.in&device=desktop`;

        const rankJson = await safeFetch(rankUrl);

        const organic = rankJson.organic_results || [];

        if (organic.length > 0) {
          googleRankPosition = organic[0].position;
          googleRankResults = organic;
          googleTopCompetitors = organic.slice(0, 5);
        }
      } catch (err) {
        console.log("⚠️ Rank tracking error:", err.message);
      }

      const lead = {
        name: i.title,
        phone,
        address: i.address || "",
        website: i.website || "",
        hasWebsite: !!i.website,

        category: i.type,
        tags: i.types || [],

        rating: i.rating || 0,
        reviews: i.reviews || 0,
        rating_breakdown: i.reviews_per_rating || {},
        review_snippet: i.reviews?.[0]?.snippet || "",

        gmap_link: i.reviews_link,
        lat: i.gps_coordinates?.latitude,
        lng: i.gps_coordinates?.longitude,

        static_map: i.gps_coordinates
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

        instagram_exact: aiIG.exact,
        instagram_suggestions: aiIG.suggestions,

        google_rank_position: googleRankPosition,
        google_rank_results: googleRankResults,
        google_rank_top_competitors: googleTopCompetitors,
        google_rank_keyword: `${i.title} ${location}`,

        followup: {
          status: "PENDING",
          whatsapp_sent_count: 0,
          history: [],
        },
      };

      lead.lead_score = scoreLead(lead);
      leads.push(lead);
    }

    // ⬆️ UPSERT INTO DATABASE
    if (leads.length) {
      const ops = leads.map((l) => {
        const { name, phone, createdAt, followup, ...rest } = l;

        return {
          updateOne: {
            filter: { phone },
            update: {
              $setOnInsert: {
                name,
                phone,
                createdAt: new Date(),
                "followup.status": "PENDING",
                "followup.whatsapp_sent_count": 0,
                "followup.history": [],
              },
              $set: rest,
            },
            upsert: true,
          },
        };
      });

      await Lead.bulkWrite(ops, { ordered: false });
    }

    console.log("✅ SCRAPE COMPLETE — SAVED:", leads.length);

    res.json({ message: "Scrape complete", saved: leads.length, leads });
  } catch (err) {
    console.error("❌ SCRAPE ERROR:", err);
    res.status(500).json({ error: "Scraping failed", details: err.message });
  }
};

/* ----------------------------------------------------
   GETTERS (Unchanged)
---------------------------------------------------- */
export const getLeadById = async (req, res) => {
  // ... (implementation unchanged)
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLeads = async (req, res) => {
  // ... (implementation unchanged)
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: "Failed to load leads" });
  }
};

export const exportCSV = async (req, res) => {
  // ... (implementation unchanged)
  try {
    const leads = await Lead.find({});
    const csv = generateCSV(leads);

    res.header("Content-Type", "text/csv");
    res.attachment("leads.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "CSV export failed" });
  }
};
