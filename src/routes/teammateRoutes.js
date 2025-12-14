import express from "express";
import {
  createTeammate,
  getTeammates,
  toggleTeammateStatus,
} from "../controllers/teammateController.js";

import { protect, companyOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// COMPANY ONLY
router.post("/", protect, companyOnly, createTeammate);
router.get("/", protect, companyOnly, getTeammates);
router.patch("/:id/toggle", protect, companyOnly, toggleTeammateStatus);

export default router;
