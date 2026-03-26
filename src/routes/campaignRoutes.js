import express from "express";
import {
    createCampaign,
    getCampaigns,
    getCampaignById,
    addLeadsToCampaign,
    toggleCampaign,
    deleteCampaign,
} from "../controllers/campaignController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createCampaign);
router.get("/", protect, getCampaigns);
router.get("/:id", protect, getCampaignById);
router.post("/:id/add-leads", protect, addLeadsToCampaign);
router.patch("/:id/toggle", protect, toggleCampaign);
router.delete("/:id", protect, deleteCampaign);

export default router;
