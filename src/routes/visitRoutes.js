import express from "express";
import Lead from "../models/Lead.js";

const router = express.Router();

/**
 * @route   POST /api/leads/track-visit
 * @desc    Increment visit count for a subdomain (non-blocking from Edge)
 * @access  Public (called from Cloudflare Worker)
 */
router.post("/track-visit", async (req, res) => {
    try {
        const { subdomain } = req.body;

        if (!subdomain) {
            return res.status(400).json({ error: "Subdomain required" });
        }

        console.log(`📡 Tracking visit for subdomain: ${subdomain}`);

        // Find the lead that owns this subdomain
        // Format of web_url is like: https://subdomain.iqsync.in
        // We match by regex to be flexible
        const lead = await Lead.findOneAndUpdate(
            { web_url: { $regex: subdomain, $options: "i" } },
            {
                $inc: { visits: 1 },
                $set: { lastVisitedAt: new Date() }
            },
            { new: true }
        );

        if (!lead) {
            console.warn(`⚠️ No lead found for subdomain: ${subdomain}`);
            return res.status(404).json({ error: "Lead not found" });
        }

        return res.json({
            success: true,
            visits: lead.visits,
            status: lead.visits >= 5 ? "Hot" : (lead.visits >= 2 ? "Warm" : "Cold")
        });

    } catch (err) {
        console.error("❌ Visit Tracking Error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
