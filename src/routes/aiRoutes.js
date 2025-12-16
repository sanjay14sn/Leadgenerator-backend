import express from "express";
import fetch from "node-fetch";
import { z, ZodError } from "zod";

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
  ENV CHECK (LOG ONCE)
------------------------------------------- */
console.log("🔐 ENV CHECK", {
  GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
  OPENVERSE_ACCESS_TOKEN: !!process.env.OPENVERSE_ACCESS_TOKEN,
});

/* -------------------------------------------
  GEMINI → SEARCH KEYWORD GENERATOR
------------------------------------------- */
async function generateSearchKeyword(prompt) {
  if (!process.env.GEMINI_API_KEY) return "";

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

Return ONLY the keyword.

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
    .split(/\s+/)
    .slice(0, 4)
    .join(" ");
}

/* -------------------------------------------
  OPENVERSE IMAGE FETCHER
------------------------------------------- */
async function fetchOpenverseImages(query, limit = 5) {
  const headers = {};

  if (process.env.OPENVERSE_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.OPENVERSE_ACCESS_TOKEN}`;
  }

  const res = await fetch(
    `https://api.openverse.org/v1/images?q=${encodeURIComponent(
      query
    )}&page_size=${limit}`,
    { headers }
  );

  if (!res.ok) {
    throw new Error(`Openverse failed: ${res.status}`);
  }

  const data = await res.json();
  return data.results || [];
}

/* -------------------------------------------
  ENHANCE ROUTE
------------------------------------------- */
router.post("/enhance", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY not configured",
      });
    }

    const { lead } = req.body;

    if (!lead) {
      return res.status(400).json({ error: "Lead data required" });
    }

    /* -------------------------------------------
      GEMINI PROMPT
    ------------------------------------------- */
    const prompt = `
Generate professional website content for the business below.

Input:
${JSON.stringify(lead, null, 2)}

Return ONLY valid JSON that strictly matches the schema.
`;

    /* -------------------------------------------
      CALL GEMINI
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

    let rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText || typeof rawText !== "string") {
      throw new Error("Gemini returned empty or invalid output");
    }

    /* -------------------------------------------
      CLEAN + PARSE JSON
    ------------------------------------------- */
    rawText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
      EnhancedSchema.parse(parsed);
    } catch (err) {
      return res.status(400).json({
        error: "Invalid Gemini response",
        details:
          err instanceof ZodError ? err.errors : err.message,
        raw: rawText,
      });
    }

    /* -------------------------------------------
      IMAGE PIPELINE (PARALLEL)
    ------------------------------------------- */
    const generatedImages = await Promise.all(
      parsed.images.map(async (img) => {
        try {
          const searchQuery = await generateSearchKeyword(img.prompt);
          if (!searchQuery) return null;

          const results = await fetchOpenverseImages(searchQuery, 5);
          if (!results.length) return null;

          const picked = results[0];

          return {
            prompt: img.prompt,
            style: img.style,
            search_query: searchQuery,
            foreign_landing_url: picked.foreign_landing_url,
            image_url: picked.url,
            thumbnail: picked.thumbnail,
            license: picked.license,
            creator: picked.creator,
            source: picked.source,
          };
        } catch {
          return null;
        }
      })
    );

    parsed.generated_images = generatedImages.filter(Boolean);

    /* -------------------------------------------
      SUCCESS
    ------------------------------------------- */
    return res.json({ enhanced: parsed });

  } catch (err) {
    console.error("❌ ENHANCE API ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
});

export default router;
