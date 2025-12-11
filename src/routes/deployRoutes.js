import express from "express";
import { publishWebsite } from "../controllers/deployController.js";

const router = express.Router();
router.post("/publish/:id", publishWebsite);

export default router;
