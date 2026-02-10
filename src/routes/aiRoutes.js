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
  testimonials: z.array(
    z.object({
      name: z.string(),
      quote: z.string(),
    })
  ).min(1),
  images: z.array(
    z.object({
      prompt: z.string(),
      style: z.string(),
    })
  ).min(1),
});

/* -------------------------------------------
   BANANA POSTER GENERATOR
------------------------------------------- */
async function generatePosterWithBanana(prompt) {
  if (!process.env.BANANA_API_KEY || !process.env.BANANA_MODEL_KEY) {
    console.warn("⚠️ Banana API not configured — skipping poster gen");
    return null;
  }

  const res = await fetch("https://api.banana.dev/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BANANA_API_KEY}`,
    },
    body: JSON.stringify({
      modelKey: process.env.BANANA_MODEL_KEY,
      modelInputs: {
        prompt: `High quality, bright, vibrant poster. ${prompt}`,
        steps: 30,
        guidance_scale: 7.5,
        width: 1024,
        height: 1024,
      },
    }),
  });

  if (!res.ok) throw new Error(`Banana API failed (${res.status})`);

  const data = await res.json();
  const output = data?.modelOutputs?.[0];

  if (!output) return null;

  /* 
    NORMALIZE — SUPPORT BOTH:
    -----------------------------------------
    1️⃣ base64String
    2️⃣ image_url
  */
  return {
    prompt,
    type: output.base64String ? "base64" : "url",
    base64: output.base64String || null,
    url: output.image_url || null,
  };
}

/* -------------------------------------------
   GEMINI → SEARCH KEYWORD
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
                text: `Convert this description into a short stock photo search keyword (2–4 words). Return ONLY the keyword.\n\n${prompt}`
              }
            ]
          }
        ]
      }),
    }
  );

  const data = await res.json();

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text)
    .join("")
    ?.trim();

  if (!text) return "";

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .slice(0, 4)
    .join(" ");
}

/* -------------------------------------------
   OPENVERSE FETCHER
------------------------------------------- */
async function fetchOpenverseImages(query, limit = 5) {
  const headers = {};

  if (process.env.OPENVERSE_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.OPENVERSE_ACCESS_TOKEN}`;
  }

  const res = await fetch(
    `https://api.openverse.org/v1/images?q=${encodeURIComponent(query)}&page_size=${limit}`,
    { headers }
  );

  if (!res.ok) throw new Error(`Openverse failed: ${res.status}`);

  const data = await res.json();
  return data.results || [];
}

/* -------------------------------------------
   ENHANCE API
------------------------------------------- */
router.post("/enhance", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    const { lead } = req.body;

    if (!lead) return res.status(400).json({ error: "Lead data required" });

    const prompt = `
You are a professional website content generator.

STRICT RULES:
- Output ONLY valid JSON
- No markdown
- No explanation
- No code block

FORMAT:
{
  "hero_title": string,
  "hero_subtitle": string,
  "description": string,
  "cta_title": string,
  "cta_button": string,
  "testimonials": [
    { "name": string, "quote": string }
  ],
  "images": [
    { "prompt": string, "style": string }
  ]
}

Business:
${JSON.stringify(lead, null, 2)}
`;

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
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
        }),
      }
    );

    const data = await response.json();

    let rawText = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      .join("")
      ?.trim();

    if (!rawText) throw new Error("Gemini returned empty output");

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
        details: err instanceof ZodError ? err.errors : err.message,
        raw: rawText,
      });
    }

    /* -------------------------------------------
       IMAGE PIPELINE
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
            ...img,
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
       POSTER GENERATION (BANANA)
    ------------------------------------------- */
    const posterPrompt =
      parsed.images?.[0]?.prompt || parsed.hero_title || "Business Poster";

    try {
      const poster = await generatePosterWithBanana(posterPrompt);
      parsed.poster = poster;
    } catch (e) {
      console.error("Poster generation failed:", e);
      parsed.poster = null;
    }

    /* -------------------------------------------
       SUCCESS
    ------------------------------------------- */
    return res.json({ enhanced: parsed });

  } catch (err) {
    console.error("❌ ENHANCE ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
});

export default router;
