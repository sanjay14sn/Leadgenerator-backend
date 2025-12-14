import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import Lead from "../models/Lead.js";
import { generateCSV } from "../utils/csvExporter.js";
import { findInstagram } from "../utils/instagramFinder.js";
import Teammate from "../models/Teammate.js";


/* ----------------------------------------------------
   LOAD SERP KEYS
---------------------------------------------------- */
const SERP_KEYS = (process.env.SERP_KEYS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function getRandomKey() {
  return SERP_KEYS[Math.floor(Math.random() * SERP_KEYS.length)];
}

/* ----------------------------------------------------
   HELPERS
---------------------------------------------------- */
async function checkWhatsApp(phone) {
  if (!phone) return false;

  const clean = phone.replace(/\D/g, "");
  const url = `https://api.whatsapp.com/send/?phone=${clean}&text&type=phone_number&app_absent=0`;

  try {
    const res = await fetch(url, { method: "GET", redirect: "manual" });
    return res.status === 200 || res.status === 302;
  } catch {
    return false;
  }
}

async function checkJustDialWhatsApp(name, city = "Chennai") {
  try {
    const url = `https://www.justdial.com/api/india_api_search.php?query=${encodeURIComponent(
      name + " " + city
    )}`;

    const res = await fetch(url);
    const text = await res.text();

    try {
      const json = JSON.parse(text);
      const jd = json?.results?.[0];

      return {
        found: !!jd?.contacts?.whatsapp,
        number: jd?.contacts?.whatsapp || "",
      };
    } catch {
      return { found: false, number: "" };
    }
  } catch {
    return { found: false, number: "" };
  }
}

function scoreLead(l) {
  let s = 0;
  if (l.whatsapp) s += 40;
  if (l.jd_whatsapp_exists) s += 30;
  if (!l.website) s += 40;
  if (l.rating >= 4.5) s += 10;
  if (l.reviews >= 50) s += 10;
  return s;
}

/* ----------------------------------------------------
   FOLLOW-UP LOGGING (PUBLIC)
---------------------------------------------------- */
export const logWhatsAppSent = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.followup.whatsapp_sent_count++;
    lead.followup.last_whatsapp_sent = new Date();

    lead.followup.history.push({
      action: "WHATSAPP_SENT",
      message: "Demo website sent",
    });

    await lead.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "WhatsApp log failed" });
  }
};

export const trackWhatsAppRedirect = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (lead) {
      lead.followup.history.push({
        action: "WHATSAPP_DELIVERED",
        message: "Lead clicked WhatsApp link",
      });
      await lead.save();
    }

    const phone = lead.phone.replace(/\D/g, "");
    return res.redirect(
      `https://wa.me/${phone}?text=${encodeURIComponent(
        "Mam/Sir, here is your sample website."
      )}`
    );
  } catch {
    res.status(500).send("Redirect failed");
  }
};

export const trackWebsiteOpen = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (lead) {
      lead.followup.history.push({
        action: "OPENED_WEBSITE",
        message: "Lead opened demo website",
      });
      await lead.save();
    }

    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
};

export const updateFollowupStatus = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { "followup.status": req.body.status },
      { new: true }
    );

    res.json({ success: true, lead });
  } catch {
    res.status(500).json({ error: "Status update failed" });
  }
};

/* ----------------------------------------------------
   SAFE FETCH (Retry 429)
---------------------------------------------------- */
async function safeFetch429(url, attempt = 1) {
  const MAX = 6;
  const WAIT = attempt * 1500;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) return await res.json();

    if (res.status === 429 && attempt < MAX) {
      await new Promise((r) => setTimeout(r, WAIT));
      url = url.replace(/api_key=[^&]+/, `api_key=${getRandomKey()}`);
      return safeFetch429(url, attempt + 1);
    }

    throw new Error("Failed " + res.status);
  } catch (err) {
    if (attempt >= MAX) throw err;
    await new Promise((r) => setTimeout(r, WAIT));
    return safeFetch429(url, attempt + 1);
  }
}

/* ----------------------------------------------------
   UPDATE LEAD (USER OWNED)
---------------------------------------------------- */
export const updateLeadData = async (req, res) => {
  try {
    delete req.body.followup;
    delete req.body.lead_score;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ----------------------------------------------------
   UPDATE + PUBLISH (USER OWNED)
---------------------------------------------------- */
export const updateLeadAndPublish = async (req, res) => {
  try {
    const update = { ...req.body };

    if (Array.isArray(update.images)) {
      update.generated_images = update.images;
      delete update.images;
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      update,
      { new: true }
    );

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const pixel = `<img src="${process.env.API_URL}/api/leads/open/${lead._id}" width="1" height="1"/>`;

    const html = `
      <html>
      <body>
        ${pixel}
        <h1>${lead.hero_title || lead.name}</h1>
        <p>${lead.hero_subtitle || ""}</p>
        ${lead.thumbnail ? `<img src="${lead.thumbnail}" />` : ""}
        <h2>About</h2>
        <p>${lead.description || ""}</p>
      </body>
      </html>
    `;

    const uploadRes = await fetch("https://api.netlify.com/api/v1/drop", {
      method: "POST",
      headers: { "Content-Type": "text/html" },
      body: html,
    });

    const data = await uploadRes.json().catch(() => ({}));
    lead.web_url = data.url || "";
    lead.last_published = new Date();
    await lead.save();

    res.json({ success: true, web_url: lead.web_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ----------------------------------------------------
   SCRAPE LEADS (USER OWNED)
---------------------------------------------------- */
export const scrapeLeads = async (req, res) => {
  try {
    const { keyword, location } = req.body;

    let url = `https://www.searchapi.io/api/v1/search?engine=google_maps&q=${encodeURIComponent(
      keyword + " in " + location
    )}&api_key=${getRandomKey()}&proxy=true&proxy_type=residential`;

    const data = await safeFetch429(url);
    const results = data.local_results || [];

    const leads = [];
    const seen = new Set();

    for (const i of results) {
      const phone = i.phone;
      if (!phone || seen.has(phone)) continue;
      seen.add(phone);

      const hasWA = await checkWhatsApp(phone);
      const jd = !hasWA ? await checkJustDialWhatsApp(i.title, location) : {};

      const images = i.photos?.map((p) => p.src) || [];
      const thumbnail = i.thumbnail || images[0];

      let ig = { exact: "", suggestions: [] };
      try {
        ig = await findInstagram({
          name: i.title,
          address: i.address,
          category: i.type,
          city: location,
          phone,
          gmap: i.reviews_link,
        });
      } catch {}

      const lead = {
        user: req.user.id, // ⭐ VERY IMPORTANT
        name: i.title,
        phone,
        address: i.address,
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

        images,
        thumbnail,
        description: i.description || "",
        hours: i.hours?.weekday_text || [],
        open_now_text: i.hours?.status || "",

        instagram_exact: ig.exact,
        instagram_suggestions: ig.suggestions,

        whatsapp: hasWA,
        jd_whatsapp_exists: jd.found || false,
        jd_whatsapp_number: jd.number || "",

        followup: {
          status: "PENDING",
          whatsapp_sent_count: 0,
          history: [],
        },
      };

      lead.lead_score = scoreLead(lead);
      leads.push(lead);
    }


// UPSERT USER-WISE (SAFE & STABLE)
// ✅ SAFE UPSERT — NO FIELD CONFLICTS
// ✅ SAFE UPSERT — NO FIELD CONFLICTS
if (leads.length) {
  const ops = leads.map((l) => ({
    updateOne: {
      filter: {
        phone: l.phone,
        user: l.user,
      },
      update: {
        $set: {
          ...l,
          updatedAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  await Lead.bulkWrite(ops, { ordered: false });


  const result = await Lead.bulkWrite(ops, { ordered: false });

  console.log("✅ BulkWrite Result:", {
    inserted: result.upsertedCount,
    modified: result.modifiedCount,
    matched: result.matchedCount,
  });
}


    res.json({ message: "Scrape complete", saved: leads.length, leads });
  } catch (err) {
    res.status(500).json({ error: "Scraping failed", details: err.message });
  }
};

/* ----------------------------------------------------
   GET LEADS (USER OWNED)
---------------------------------------------------- */
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(leads);
  } catch {
    res.status(500).json({ message: "Failed to load leads" });
  }
};

/* ----------------------------------------------------
   GET SINGLE LEAD (USER OWNED)
---------------------------------------------------- */
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    res.json(lead);
  } catch {
    res.status(500).json({ message: "Error fetching lead" });
  }
};

/* ----------------------------------------------------
   EXPORT CSV (USER OWNED)
---------------------------------------------------- */
export const exportCSV = async (req, res) => {
  try {
    const leads = await Lead.find({ user: req.user.id });

    const csv = generateCSV(leads);

    res.header("Content-Type", "text/csv");
    res.attachment("leads.csv");
    res.send(csv);
  } catch {
    res.status(500).json({ error: "CSV export failed" });
  }
};
/* ----------------------------------------------------
   ADD FOLLOW-UP NOTE (SAFE)
---------------------------------------------------- */
export const addFollowupNote = async (req, res) => {
  try {
    const { message } = req.body;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        $push: {
          "followup.history": {
            action: "MANUAL_NOTE",
            message,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const assignLead = async (req, res) => {
  try {
    const { agent_id } = req.body;

    const lead = await Lead.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // UNASSIGN
    if (!agent_id) {
      lead.assigned_to_id = null;
      lead.assigned_to_name = "";
      lead.assigned_at = null;
      lead.locked = false;
    } else {
      const agent = await Teammate.findById(agent_id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      lead.assigned_to_id = agent._id;
      lead.assigned_to_name = agent.name;
      lead.assigned_at = new Date();
      lead.locked = true;
    }

    await lead.save();
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* ----------------------------------------------------
   SCHEDULE FOLLOW-UP
---------------------------------------------------- */
export const scheduleFollowup = async (req, res) => {
  try {
    const { date, note } = req.body;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        next_followup_date: new Date(date),
        next_followup_note: note || "",
      },
      { new: true }
    );

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* ----------------------------------------------------
   AUTO ROUND-ROBIN ASSIGNMENT
---------------------------------------------------- */
export const autoAssignLeads = async (req, res) => {
  try {
    const agents = await Teammate.find({
      createdBy: req.user.id,
      role: "AGENT",
      isActive: true,
    });

    if (!agents.length) {
      return res.status(400).json({ message: "No active agents" });
    }

    const unassignedLeads = await Lead.find({
      user: req.user.id,
      assigned_to_id: null,
    });

    let index = 0;
    for (const lead of unassignedLeads) {
      const agent = agents[index % agents.length];

      lead.assigned_to_id = agent._id;
      lead.assigned_to_name = agent.name;
      lead.assigned_at = new Date();
      lead.locked = true;

      await lead.save();
      index++;
    }

    res.json({
      success: true,
      assigned: unassignedLeads.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
