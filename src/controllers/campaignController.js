import Campaign from "../models/Campaign.js";
import Lead from "../models/Lead.js";

// @desc    Create a new campaign
// @route   POST /api/campaigns
export const createCampaign = async (req, res) => {
    try {
        const { name } = req.body;
        const campaign = await Campaign.create({
            name,
            user: req.user.id,
        });
        res.status(201).json(campaign);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get all campaigns for user
// @route   GET /api/campaigns
export const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(campaigns);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
export const getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });
        res.json(campaign);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Add leads to campaign
// @route   POST /api/campaigns/:id/add-leads
export const addLeadsToCampaign = async (req, res) => {
    try {
        const { leadIds } = req.body;
        const campaignId = req.params.id;

        if (!leadIds || !leadIds.length) {
            return res.status(400).json({ message: "No leads selected" });
        }

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });

        // Update campaign stats
        campaign.total_leads += leadIds.length;
        await campaign.save();

        // Stagger process_at (30s interval)
        const now = new Date();
        const updates = leadIds.map((id, index) => {
            const processAt = new Date(now.getTime() + index * 30000); // 30s delay
            return Lead.findByIdAndUpdate(id, {
                campaign_id: campaignId,
                campaign_status: "queued",
                process_at: processAt,
            });
        });

        await Promise.all(updates);

        res.json({ message: `${leadIds.length} leads added to campaign`, campaign });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Toggle campaign status (Start/Pause)
// @route   POST /api/campaigns/:id/toggle
export const toggleCampaign = async (req, res) => {
    try {
        const { status } = req.body; // "running" or "paused"
        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(campaign);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete campaign (And reset leads)
// @route   DELETE /api/campaigns/:id
export const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user.id });
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });

        // 1. Reset all leads associated with this campaign
        await Lead.updateMany(
            { campaign_id: req.params.id },
            {
                $set: {
                    campaign_id: null,
                    campaign_status: "new",
                    process_at: null,
                }
            }
        );

        // 2. Delete the campaign
        await campaign.deleteOne();

        res.json({ success: true, message: "Campaign deleted and leads reset" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
