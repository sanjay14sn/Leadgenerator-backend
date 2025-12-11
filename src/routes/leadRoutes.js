import express from "express";
import {
  scrapeLeads,
  getLeads,
  exportCSV,
  getLeadById,
  updateLead,
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

// UPDATE LEAD
router.patch("/:id", updateLead);

export default router;
