import express from "express";
import { generateCustomPosters } from "../utils/customPosterGenerator.js";

const router = express.Router();

router.post("/generate-custom-posters", async (req, res) => {
  try {
    const { prompt, name, location, phone } = req.body;

    if (!prompt || !name) {
      return res.status(400).json({ error: "Name and Prompt are required" });
    }

    console.log("🚀 Generation Started...");

    // IMPORTANT: Use await so the code waits for the loop to finish
    const posterUrls = await generateCustomPosters({
      prompt,
      title: name,
      subtitle: "Join us for a bright future!",
      badge: "Open 2026",
      location,
      phone
    });

    if (posterUrls.length === 0) {
      return res.status(500).json({ error: "Failed to generate any posters" });
    }

    // Explicitly send the JSON response to prevent 204
    console.log("✅ Sending URLs to frontend:", posterUrls);
    return res.status(200).json({ posters: posterUrls });

  } catch (error) {
    console.error("🔥 Route Error:", error);
    return res.status(500).json({ error: "Server Error during generation" });
  }
});

export default router;