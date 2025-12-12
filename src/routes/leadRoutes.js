// src/routes/leadRoutes.js

import express from "express";
import {
  scrapeLeads,
  getLeads,
  exportCSV,
  getLeadById,
  updateLeadAndPublish, // Renamed controller
  updateLeadData,       // NEW controller for simple data/notes
  logWhatsAppSent,
  trackWhatsAppRedirect,
  trackWebsiteOpen,
  updateFollowupStatus,
} from "../controllers/leadController.js";

const router = express.Router();

// SCRAPE LEADS
router.post("/scrape", scrapeLeads);

// GET ALL LEADS
router.get("/", getLeads);

// EXPORT CSV
router.get("/export", exportCSV);

// GET SINGLE LEAD
router.get("/:id", getLeadById);

// UPDATE LEAD DATA (Used by frontend for adding notes/simple updates)
// The frontend's `addNote` logic will now hit this faster endpoint.
router.patch("/:id", updateLeadData); 

// UPDATE LEAD AND PUBLISH WEBSITE (For website builder feature)
router.patch("/:id/publish", updateLeadAndPublish); // New dedicated route

// LOG WHATSAPP SENT
router.post("/:id/whatsapp-log", logWhatsAppSent);

// TRACK WHATSAPP REDIRECT
router.get("/w/:id", trackWhatsAppRedirect);

// TRACK WEBSITE OPEN (Pixel)
router.get("/open/:id", trackWebsiteOpen);

router.post("/:id/update-status", updateFollowupStatus);

export default router;