// src/routes/deployRoutes.js
import express from "express";
import { publishWebsite } from "../controllers/deployController.js";

const router = express.Router();

// POST /api/deploy/publish/:id
router.post("/publish/:id", publishWebsite);

export default router;
