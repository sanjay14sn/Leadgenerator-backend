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
  addFollowupNote,
} from "../controllers/leadController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------------------------------
   🔐 PROTECTED ROUTES (JWT REQUIRED)
---------------------------------------------------- */

// 1️⃣ Scrape leads (Google Maps → DB)
router.post("/scrape", protect, scrapeLeads);

// 2️⃣ Get all leads for logged-in user
router.get("/", protect, getLeads);

// 3️⃣ Export CSV
router.get("/export", protect, exportCSV);

// 4️⃣ Get single lead
router.get("/:id", protect, getLeadById);

// 5️⃣ Update lead basic fields (NO followup updates here)
router.patch("/:id", protect, updateLeadData);

// 6️⃣ Update + publish website
router.patch("/:id/publish", protect, updateLeadAndPublish);

// 7️⃣ Update follow-up status (Interested / Not Interested / etc)
router.post("/:id/update-status", protect, updateFollowupStatus);

// 8️⃣ ✅ ADD FOLLOW-UP NOTE (IMPORTANT)
router.post("/:id/add-note", protect, addFollowupNote);

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
