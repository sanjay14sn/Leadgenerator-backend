import express from "express";
import {
  createTeammate,
  getTeammates,
  toggleTeammateStatus,
  getTeammatePerformance
} from "../controllers/teammateController.js";

import { protect, companyOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// COMPANY ONLY
router.post("/", protect, companyOnly, createTeammate);
router.get("/", protect, companyOnly, getTeammates);
router.patch("/:id/toggle", protect, companyOnly, toggleTeammateStatus);
router.get("/performance", protect, companyOnly, getTeammatePerformance);

export default router;
