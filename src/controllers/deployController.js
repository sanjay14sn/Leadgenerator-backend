// src/controllers/deployController.js
import Lead from "../models/Lead.js";
import { generateFullHTML } from "../utils/htmlGenerator.js";
import { uploadToNetlify } from "../utils/netlifyPublisher.js"; // we create this next

export const publishWebsite = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Load lead data
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // 2) Generate HTML from template
    const html = generateFullHTML(lead);

    // 3) Deploy HTML to Netlify (or Vercel)
    const url = await uploadToNetlify({
      html,
      subdomain: lead.name.replace(/\s+/g, "").toLowerCase(),
    });

    // 4) Save URL in DB
    lead.web_url = url;
    await lead.save();

    res.json({ success: true, url });
  } catch (err) {
    console.error("🔥 Publish Error:", err);
    res.status(500).json({ message: "Publish failed", error: err.message });
  }
};
