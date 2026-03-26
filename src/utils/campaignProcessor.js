import Lead from "../models/Lead.js";
import Campaign from "../models/Campaign.js";
import { generateSiteCode } from "./aiGenerator.js";
import { publishToCloudflareKV } from "./cloudflarePublisher.js";
import { generateSubdomain } from "./subdomainGenerator.js";
import { appendLeadToSheet } from "./googleSheets.js";

let isProcessing = false;

export const startCampaignProcessor = () => {
    console.log("🤖 Campaign Processor Started (Every 10s)");

    setInterval(async () => {
        if (isProcessing) return;
        isProcessing = true;

        try {
            // 1. Fetch "queued" leads that are ready (process_at <= now)
            // Only from "running" campaigns
            const runningCampaigns = await Campaign.find({ status: "running" }).select("_id");
            const campaignIds = runningCampaigns.map(c => c._id);

            if (!campaignIds.length) {
                isProcessing = false;
                return;
            }

            const leads = await Lead.find({
                campaign_id: { $in: campaignIds },
                campaign_status: "queued",
                process_at: { $lte: new Date() }
            }).limit(5); // Process up to 5 at a time

            if (!leads.length) {
                isProcessing = false;
                return;
            }

            console.log(`🚀 Processing batch of ${leads.length} leads...`);

            for (const lead of leads) {
                try {
                    // Update status to "processing"
                    lead.campaign_status = "processing";
                    await lead.save();

                    console.log(`✨ Architecting site for: ${lead.name}`);

                    // 2. Generate AI Site Code
                    const { html: aiHtml, css: aiCss } = await generateSiteCode(lead);

                    // 3. Publish to Cloudflare KV
                    const subdomain = `${generateSubdomain(lead.name)}-${lead._id.toString().slice(-4)}`;
                    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${lead.name || "Business Website"}</title>
    <style>${aiCss}</style>
</head>
<body>${aiHtml}</body>
</html>`;

                    const webUrl = await publishToCloudflareKV(subdomain, fullHtml);

                    // 4. Update Lead to "sent" (ready for manual WhatsApp)
                    lead.generated_html_code = aiHtml;
                    lead.generated_css_code = aiCss;
                    lead.web_url = webUrl;
                    lead.campaign_status = "sent";
                    await lead.save();

                    // 5. Append to Google Sheets (Async)
                    appendLeadToSheet(lead).catch(err => console.error("Sheets Async Error:", err));

                    // Increment campaign success count
                    await Campaign.findByIdAndUpdate(lead.campaign_id, { $inc: { processed_count: 1, success_count: 1 } });

                    console.log(`✅ Ready to send: ${lead.name} -> ${webUrl}`);

                } catch (err) {
                    console.error(`❌ Error processing lead ${lead.name}:`, err.message);
                    lead.campaign_status = "error";
                    lead.last_error = err.message;
                    await lead.save();

                    await Campaign.findByIdAndUpdate(lead.campaign_id, { $inc: { processed_count: 1, error_count: 1 } });
                }
            }

        } catch (err) {
            console.error("🔥 Campaign Processor Error:", err.message);
        } finally {
            isProcessing = false;
        }
    }, 10000); // Check every 10 seconds
};
