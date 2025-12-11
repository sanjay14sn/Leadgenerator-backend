import Lead from "../models/Lead.js";
import { generateFullHTML } from "../utils/htmlGenerator.js";
import { publishToCloudflareKV } from "../utils/cloudflarePublisher.js";
import { generateSubdomain } from "../utils/subdomainGenerator.js";

export const publishWebsite = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🚀 Publishing Website for Lead:", id);

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // generate clean subdomain
    const subdomain = generateSubdomain(lead.name);
    console.log("🌐 Subdomain:", subdomain);

    const html = generateFullHTML(lead);

    // Upload to Cloudflare KV
    const url = await publishToCloudflareKV(subdomain, html);

    lead.web_url = url;
    await lead.save();

    return res.json({ success: true, url });
  } catch (err) {
    console.error("🔥 Publish Error:", err);
    return res.status(500).json({ message: "Publish failed", error: err.message });
  }
};
