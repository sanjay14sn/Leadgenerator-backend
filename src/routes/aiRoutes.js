import express from "express";
import fetch from "node-fetch";
import { z } from "zod";

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
  GEMINI STRUCTURED OUTPUT SCHEMA
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
      minItems: 1,
      maxItems: 1,
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          quote: { type: "string" },
        },
      },
    },
    images: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          prompt: { type: "string" },
          style: { type: "string" },
        },
      },
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
  GEMINI → SEARCH KEYWORD GENERATOR
------------------------------------------- */
async function generateSearchKeyword(prompt) {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
Convert the following image description into a SHORT
search keyword (2–4 words max) suitable for stock photo search.

Return ONLY the keyword. No explanation.

Description:
${prompt}
                `,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await res.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) return "";

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ")
    .slice(0, 4)
    .join(" ");
}

/* -------------------------------------------
  OPENVERSE IMAGE FETCHER
------------------------------------------- */
async function fetchOpenverseImages(query, limit = 5) {
  const res = await fetch(
    `https://api.openverse.org/v1/images?q=${encodeURIComponent(
      query
    )}&page_size=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENVERSE_ACCESS_TOKEN}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Openverse API failed: ${res.status}`);
  }

  const data = await res.json();
  return data.results || [];
}

/* -------------------------------------------
  ENHANCE ROUTE
------------------------------------------- */
router.post("/enhance", async (req, res) => {
  try {
    const { lead } = req.body;

    if (!lead) {
      return res.status(400).json({ error: "Lead data required" });
    }

    /* -------------------------------------------
      GEMINI PROMPT FOR CONTENT
    ------------------------------------------- */
    const prompt = `
Generate professional website content for the business below.

Input:
${JSON.stringify(lead, null, 2)}

Return ONLY JSON that strictly matches the schema.
`;

    /* -------------------------------------------
      CALL GEMINI (CONTENT)
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
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({
        error: "Gemini returned empty output",
        debug: data,
      });
    }

    /* -------------------------------------------
      PARSE + VALIDATE
    ------------------------------------------- */
    let parsed;
    try {
      parsed = JSON.parse(rawText);
      EnhancedSchema.parse(parsed);
    } catch (err) {
      return res.status(400).json({
        error: "Invalid Gemini response",
        details: err.errors || err.message,
      });
    }

    /* -------------------------------------------
      IMAGE SEARCH PIPELINE
    ------------------------------------------- */
    const generatedImages = [];

    for (const img of parsed.images) {
      const searchQuery = await generateSearchKeyword(img.prompt);
      if (!searchQuery) continue;

      const results = await fetchOpenverseImages(searchQuery, 5);
      if (!results.length) continue;

      const picked = results[0];

      generatedImages.push({
        prompt: img.prompt,
        style: img.style,
        search_query: searchQuery,
        foreign_landing_url: picked.foreign_landing_url,
        image_url: picked.url,
        thumbnail: picked.thumbnail,
        license: picked.license,
        creator: picked.creator,
        source: picked.source,
      });
    }

    parsed.generated_images = generatedImages;

    /* -------------------------------------------
      FINAL RESPONSE
    ------------------------------------------- */
    return res.json({ enhanced: parsed });

  } catch (err) {
    console.error("❌ Enhance API Error:", err);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
});

export default router;
