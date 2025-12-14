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
  assignLead,
  scheduleFollowup,
  autoAssignLeads,
} from "../controllers/leadController.js";

import { protect, companyOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------------------------------
   🔐 PROTECTED ROUTES
---------------------------------------------------- */
router.post("/scrape", protect, scrapeLeads);
router.get("/", protect, getLeads);
router.get("/export", protect, exportCSV);
router.get("/:id", protect, getLeadById);
router.patch("/:id", protect, updateLeadData);
router.patch("/:id/publish", protect, updateLeadAndPublish);
router.post("/:id/update-status", protect, updateFollowupStatus);
router.post("/:id/add-note", protect, addFollowupNote);

/* ----------------------------------------------------
   🔥 NEW CRM ROUTES
---------------------------------------------------- */

// Assign / Unassign lead
router.post("/:id/assign", protect, assignLead);

// Schedule follow-up
router.post("/:id/schedule-followup", protect, scheduleFollowup);

// Auto round-robin assignment (COMPANY only)
router.post("/auto-assign", protect, companyOnly, autoAssignLeads);

/* ----------------------------------------------------
   🌍 PUBLIC ROUTES
---------------------------------------------------- */
router.post("/:id/whatsapp-log", logWhatsAppSent);
router.get("/w/:id", trackWhatsAppRedirect);
router.get("/open/:id", trackWebsiteOpen);

export default router;
