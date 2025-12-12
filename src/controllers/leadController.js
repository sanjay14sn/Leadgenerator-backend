// src/controllers/leadController.js

import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import Lead from "../models/Lead.js";
import { generateCSV } from "../utils/csvExporter.js";
import { findInstagram } from "../utils/instagramFinder.js";

/* ----------------------------------------------------
   MULTI KEY LOADING (SAFE + NO DUPLICATES)
---------------------------------------------------- */
const SERP_KEYS = (process.env.SERP_KEYS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function getRandomKey() {
  return SERP_KEYS[Math.floor(Math.random() * SERP_KEYS.length)];
}

/* ----------------------------------------------------
   HELPERS (Unchanged)
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

async function checkJustDialWhatsApp(businessName, city = "Chennai") {
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
      console.log("JD WhatsApp error: non-JSON");
      return { found: false, number: "" };
    }
  } catch (err) {
    console.log("JD WhatsApp error:", err.message);
    return { found: false, number: "" };
  }
}

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
   FOLLOW-UP ACTIONS
---------------------------------------------------- */
export const logWhatsAppSent = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) return res.status(404).json({ message: "Lead not found" });

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
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).send("Lead not found");

    lead.followup.history.push({
      action: "WHATSAPP_DELIVERED",
      message: "Lead clicked WhatsApp message link",
    });

    await lead.save();

    const phone = lead.phone.replace(/\D/g, "");
    const msg = encodeURIComponent("Mam/Sir, here is your sample website.");

    return res.redirect(`https://wa.me/${phone}?text=${msg}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Redirect failed");
  }
};

export const trackWebsiteOpen = async (req, res) => {
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
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { "followup.status": req.body.status },
      { new: true }
    );

    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: "Status update failed" });
  }
};

/* ----------------------------------------------------
   429-PROOF FETCH WRAPPER
---------------------------------------------------- */
async function safeFetch429(url, attempt = 1) {
  const MAX_RETRIES = 7;
  const WAIT = attempt * 1500;

  try {
    console.log(`🌍 Fetch Attempt ${attempt}: ${url}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) return await res.json();

    if (res.status === 429) {
      console.log(`❌ 429 RATE LIMIT → Wait ${WAIT}ms and retry`);

      if (attempt === MAX_RETRIES) throw new Error("Too many retries (429)");

      await new Promise((r) => setTimeout(r, WAIT));

      url = url.replace(/api_key=[^&]+/, `api_key=${getRandomKey()}`);

      return safeFetch429(url, attempt + 1);
    }

    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    if (attempt === MAX_RETRIES) throw err;

    await new Promise((r) => setTimeout(r, WAIT));
    return safeFetch429(url, attempt + 1);
  }
}

/* ----------------------------------------------------
   SIMPLE UPDATE (Notes etc.)
---------------------------------------------------- */
export const updateLeadData = async (req, res) => {
  try {
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

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Lead not found" });

    res.json(updated);
  } catch (err) {
    console.error("SIMPLE UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ----------------------------------------------------
   UPDATE + PUBLISH (Netlify)
---------------------------------------------------- */
export const updateLeadAndPublish = async (req, res) => {
  try {
    const update = { ...req.body };

    if (Array.isArray(req.body.images) && typeof req.body.images[0] === "object") {
      update.generated_images = req.body.images;
      delete update.images;
    }

    const updated = await Lead.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Lead not found" });

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
      console.error("Netlify returned non-JSON");
    }

    if (webUrl) {
      updated.web_url = webUrl;
      updated.last_published = new Date();
      await updated.save();
    }

    res.json({ updated, web_url: webUrl });
  } catch (err) {
    console.error("PUBLISH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ----------------------------------------------------
   SCRAPE LEADS – 429 PRO MAX VERSION
---------------------------------------------------- */
export const scrapeLeads = async (req, res) => {
  try {
    const { keyword, location } = req.body;
    console.log("🔥 SCRAPER STARTED:", keyword, location);

    let apiKey = getRandomKey();

    let url = `https://www.searchapi.io/api/v1/search?engine=google_maps&q=${encodeURIComponent(
      keyword + " in " + location
    )}&api_key=${apiKey}&proxy=true&proxy_type=residential&country=IN&domain=google.co.in&device=desktop`;

    console.log("🌍 FETCHING MAP RESULTS...");

    const data = await safeFetch429(url);
    const results = data.local_results || [];

    const leads = [];
    const seenPhones = new Set();

    for (const i of results) {
      const phone = i.phone || "";
      if (!phone || seenPhones.has(phone)) continue;
      seenPhones.add(phone);

      const hasWhatsapp = await checkWhatsApp(phone);

      let jdWhatsapp = { found: false, number: "" };
      if (!hasWhatsapp)
        jdWhatsapp = await checkJustDialWhatsApp(i.title, location);

      const images = i.photos?.map((p) => p.src) || [];
      const thumbnail = i.thumbnail || images[0] || "";

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

        instagram_exact: aiIG.exact,
        instagram_suggestions: aiIG.suggestions,

        whatsapp: hasWhatsapp,
        jd_whatsapp_exists: jdWhatsapp.found,
        jd_whatsapp_number: jdWhatsapp.number,

        google_rank_position: null,
        google_rank_results: [],
        google_rank_top_competitors: [],
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

    res.json({
      message: "Scrape complete",
      saved: leads.length,
      leads,
    });
  } catch (err) {
    console.error("❌ SCRAPE ERROR:", err);
    res.status(500).json({
      error: "Scraping failed",
      details: err.message,
    });
  }
};

/* ----------------------------------------------------
   GETTERS
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

export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: "Failed to load leads" });
  }
};

export const exportCSV = async (req, res) => {
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
