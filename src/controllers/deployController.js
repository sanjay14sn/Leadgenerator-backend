// src/controllers/deployController.js
import Lead from "../models/Lead.js";
import { generateFullHTML } from "../utils/htmlGenerator.js";
import { generateSubdomain } from "../utils/subdomainGenerator.js";
import { uploadToNetlify } from "../utils/netlifyPublisher.js";

export const publishWebsite = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Generate clean DNS-safe subdomain
    const subdomain = generateSubdomain(lead.name);

    const html = generateFullHTML(lead);

    const url = await uploadToNetlify({ html, subdomain });

    lead.web_url = url;
    await lead.save();

    res.json({ success: true, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Publish failed", error: err.message });
  }
};
