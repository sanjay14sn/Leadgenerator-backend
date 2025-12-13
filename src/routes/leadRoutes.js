import express from "express";
import {
  scrapeLeads,
  getLeads,
  exportCSV,
  getLeadById,
  updateLeadAndPublish,
  updateLeadData,
  logWhatsAppSent,
  trackWhatsAppRedirect,
  trackWebsiteOpen,
  updateFollowupStatus,
} from "../controllers/leadController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------------------------------
   🔐 PROTECTED ROUTES (JWT REQUIRED)
---------------------------------------------------- */

// Scrape leads (Google Maps → DB)
router.post("/scrape", protect, scrapeLeads);

// Get all leads for logged-in user
router.get("/", protect, getLeads);

// Export CSV
router.get("/export", protect, exportCSV);

// Get single lead
router.get("/:id", protect, getLeadById);

// Update lead fields
router.patch("/:id", protect, updateLeadData);

// Update + publish website
router.patch("/:id/publish", protect, updateLeadAndPublish);

// Update follow-up status
router.post("/:id/update-status", protect, updateFollowupStatus);

/* ----------------------------------------------------
   🌍 PUBLIC ROUTES (NO AUTH)
---------------------------------------------------- */

// Log WhatsApp sent
router.post("/:id/whatsapp-log", logWhatsAppSent);

// WhatsApp redirect tracking
router.get("/w/:id", trackWhatsAppRedirect);

// Website open tracking pixel
router.get("/open/:id", trackWebsiteOpen);

export default router;
