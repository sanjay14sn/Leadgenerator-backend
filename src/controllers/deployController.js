// import Lead from "../models/Lead.js";
// import { generateFullHTML } from "../utils/htmlGenerator.js";
// import { publishToCloudflareKV } from "../utils/cloudflarePublisher.js";
// import { generateSubdomain } from "../utils/subdomainGenerator.js";

// export const publishWebsite = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("🚀 Publishing Website for Lead:", id);

//     const lead = await Lead.findById(id);
//     if (!lead) return res.status(404).json({ message: "Lead not found" });

//     // generate clean subdomain
//     const subdomain = generateSubdomain(lead.name);
//     console.log("🌐 Subdomain:", subdomain);

//     const html = generateFullHTML(lead);

//     // Upload to Cloudflare KV
//     const handlePublish = async () => {
//         setIsPublishing(true);
//         console.log("🚀 Starting publish for ID:", id);
//         try {
//             const res = await API.patch(`/deploy/${id}/publish`);
//             console.log("📨 Publish Response received:", res.data);
//             if (res.data.success) {
//                 setShowPublishSuccess(true);
//             }
//         } catch (err) {
//             console.error("🔥 Publish failed error details:", err);
//             const errMsg = err.response?.data?.message || err.message;
//             alert(`Failed to publish website: ${errMsg}`);
//         } finally {
//             setIsPublishing(false);
//         }
//     };
//     const url = await publishToCloudflareKV(subdomain, html);

//     lead.web_url = url;
//     await lead.save();

//     return res.json({
//       success: true,
//       web_url: url,
//     });
//   } catch (err) {
//     console.error("🔥 Publish Error:", err);
//     return res
//       .status(500)
//       .json({ message: "Publish failed", error: err.message });
//   }
// };

import Lead from "../models/Lead.js";
import { generateFullHTML } from "../utils/htmlGenerator.js";
import { publishToCloudflareKV } from "../utils/cloudflarePublisher.js";
import { generateSubdomain } from "../utils/subdomainGenerator.js";
import { generatePoster } from "../utils/posterGenerator.js";

export const publishWebsite = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🚀 Publishing Website for Lead:", id);

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // SUBDOMAIN
    const subdomain = `${generateSubdomain(lead.name)}-${lead._id.toString().slice(-4)}`;

    // 🛠 Determine which HTML to publish
    let html = "";
    if (lead.generated_html_code) {
      console.log("🤖 Using AI-generated code for publication");
      html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${lead.name || "Business Website"}</title>
    <style>
        ${lead.generated_css_code || ""}
    </style>
</head>
<body>
    ${lead.generated_html_code}
</body>
</html>`;
    } else {
      console.log("📄 AI code missing, falling back to static template");
      html = generateFullHTML(lead);
    }

    // 🌐 Publish Website
    console.log("🛠 Attempting to publish lead to Cloudflare KV...");
    const url = await publishToCloudflareKV(subdomain, html);
    console.log("🌍 Successfully published! URL:", url);

    // 🎨 Try creating the poster but don't break if it fails
    let posterPath = "";
    try {
      posterPath = await generatePoster(
        lead.name,
        lead.address || "",
        lead.phone || ""
      );
    } catch (err) {
      console.error("Poster creation failed:", err.message);
    }

    // SAVE BOTH
    lead.web_url = url;
    if (posterPath) {
      lead.poster_url = posterPath;
    }
    await lead.save();

    return res.json({
      success: true,
      web_url: url,
      poster_url: posterPath,
    });
  } catch (err) {
    console.error("🔥 Publish Error:", err);
    return res
      .status(500)
      .json({ message: "Publish failed", error: err.message });
  }
};
