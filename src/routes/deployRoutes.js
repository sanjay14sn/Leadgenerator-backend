import express from "express";
import { publishWebsite } from "../controllers/deployController.js";

const router = express.Router();

router.patch("/:id/publish", publishWebsite);

export default router;
