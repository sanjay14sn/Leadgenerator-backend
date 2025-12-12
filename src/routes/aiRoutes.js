import express from "express";
import fetch from "node-fetch";
import { z } from "zod";
import { generateAndUploadImage } from "../utils/aiImageGenerator.js";

const router = express.Router();

/* -------------------------------------------
  ZOD VALIDATION SCHEMA
------------------------------------------- */
const EnhancedSchema = z.object({
  hero_title: z.string(),
  hero_subtitle: z.string(),
  description: z.string(),
  cta_title: z.string(),
  cta_button: z.string(),
  testimonials: z
    .array(z.object({ name: z.string(), quote: z.string() }))
    .length(1),
  images: z
    .array(z.object({ prompt: z.string(), style: z.string() }))
    .length(3),
});

/* -------------------------------------------
      GEMINI OUTPUT SCHEMA
------------------------------------------- */
const geminiSchema = {
  type: "object",
  properties: {
    hero_title: { type: "string" },
    hero_subtitle: { type: "string" },
    description: { type: "string" },
    cta_title: { type: "string" },
    cta_button: { type: "string" },
    testimonials: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          quote: { type: "string" },
        },
      },
      minItems: 1,
      maxItems: 1,
    },
    images: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prompt: { type: "string" },
          style: { type: "string" },
        },
      },
      minItems: 3,
      maxItems: 3,
    },
  },
  required: [
    "hero_title",
    "hero_subtitle",
    "description",
    "cta_title",
    "cta_button",
    "testimonials",
    "images",
  ],
};

/* -------------------------------------------
          ENHANCE ROUTE (FINAL VERSION)
------------------------------------------- */
router.post("/enhance", async (req, res) => {
  try {
    const { lead } = req.body;

    const prompt = `
Generate high-quality preschool/daycare website content based on:

${JSON.stringify(lead, null, 2)}

Return ONLY JSON that matches the schema.
    `;

    /* -------------------------------------------
          CALL GEMINI FOR TEXT CONTENT
    ------------------------------------------- */
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: geminiSchema,
          },
        }),
      }
    );

    const data = await response.json();

    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return res.status(500).json({
        error: "Gemini returned no output",
        details: data,
      });
    }

    const rawJSON = data.candidates[0].content.parts[0].text;

    let parsed = {};
    try {
      parsed = JSON.parse(rawJSON);
    } catch (err) {
      console.error("JSON parse error:", err);
      return res.status(400).json({
        error: "Gemini returned invalid JSON",
        raw: rawJSON,
      });
    }

    /* -------------------------------------------
          VALIDATE USING ZOD
    ------------------------------------------- */
    try {
      EnhancedSchema.parse(parsed);
    } catch (err) {
      return res.status(400).json({
        error: "Zod validation failed",
        details: err.errors,
        raw: parsed,
      });
    }

    /* -------------------------------------------
          GENERATE REAL IMAGES USING GEMINI
          AND UPLOAD TO CLOUDINARY
    ------------------------------------------- */
    const generatedImages = [];

    for (const img of parsed.images) {
      const cloudinaryURL = await generateAndUploadImage(img.prompt, img.style);

      generatedImages.push({
        prompt: img.prompt,
        style: img.style,
        url: cloudinaryURL,
      });
    }

    parsed.generated_images = generatedImages;

    /* -------------------------------------------
          SEND FINAL RESULT
    ------------------------------------------- */
    return res.json({ enhanced: parsed });

  } catch (err) {
    console.error("❌ Enhance Error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

export default router;
