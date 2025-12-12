// src/routes/kvRoutes.js

import express from "express";
import {
  deleteSite,
  listAllSites,
  bulkDelete,
  createSite
} from "../controllers/kvController.js";

const router = express.Router();

// List all published sites
router.get("/", listAllSites);

// Delete specific site from KV
router.delete("/:key", deleteSite);

// Bulk delete all sites
router.delete("/", bulkDelete);

router.post("/create", createSite);

export default router;