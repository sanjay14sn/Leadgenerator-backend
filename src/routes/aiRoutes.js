import express from "express";
import fetch from "node-fetch";
import { z, ZodError } from "zod";
import Lead from "../models/Lead.js";
import { generateSiteCode } from "../utils/aiGenerator.js";

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
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
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

    console.log("🚀 Attempting Gemini...");
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          },
          safetySettings: [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH" }
          ]
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("❌ Gemini API ERROR Response:", JSON.stringify(data, null, 2));
      if (data.error.code === 429) {
        throw new Error("Gemini quota exceeded. Please wait a minute or enable billing.");
      }
      throw new Error(`Gemini API Error: ${data.error.message || "Unknown error"}`);
    }

    const candidate = data?.candidates?.[0];
    let rawText = candidate?.content?.parts?.map((p) => p.text).join("")?.trim();

    if (!rawText) {
      console.warn("⚠️ Gemini returned EMPTY output or was BLOCKED.");
      console.warn("Full Candidate Detail:", JSON.stringify(candidate, null, 2));

      const finishReason = candidate?.finishReason;
      if (finishReason === "SAFETY") {
        throw new Error("Gemini blocked the response due to safety filters. Try a different business description.");
      }
      throw new Error(`Gemini returned empty output. Reason: ${finishReason || "Unknown"}`);
    }

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

/* -------------------------------------------
   GENERATE SITE CODE (PREMIUM HTML/CSS)
------------------------------------------- */
router.post("/generate-site-code", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    const { id, lead, instructions } = req.body;

    if (!lead) {
      return res.status(400).json({ error: "Lead data required" });
    }

    console.log("=======================================");
    console.log("🚀 SITE GENERATION STARTED");
    console.log("Business:", lead.name);
    console.log("Category:", lead.category);
    console.log("=======================================");

    const parsed = await generateSiteCode(lead, instructions);

    if (!parsed.html || !parsed.css) {
      throw new Error("Invalid response from site generator.");
    }

    /* ------------------ SAVE TO DB ------------------ */

    let updatedLead = null;
    let leadId = id;

    if (id) {
      updatedLead = await Lead.findByIdAndUpdate(
        id,
        {
          generated_html_code: parsed.html,
          generated_css_code: parsed.css,
        },
        { new: true }
      );
    } else {
      const newLead = await Lead.create({
        ...lead,
        generated_html_code: parsed.html,
        generated_css_code: parsed.css,
      });
      updatedLead = newLead;
      leadId = newLead._id;
    }

    console.log("=======================================");
    console.log("✅ SITE GENERATED SUCCESSFULLY");
    console.log("🆔 YOUR_LEAD_ID:", leadId);
    console.log(`🌐 Preview URL: http://localhost:${process.env.PORT || 5010}/api/ai/preview/` + leadId);
    console.log("=======================================");

    return res.json({
      success: true,
      leadId: leadId,
      previewUrl: `http://localhost:${process.env.PORT || 5010}/api/ai/preview/${leadId}`,
      model: result.modelUsed,
      usage: result.usage,
      html: parsed.html,
      css: parsed.css,
      lead: updatedLead
    });

  } catch (err) {
    console.error("❌ SITE GENERATION ERROR:", err.message);

    return res.status(500).json({
      error: "Generation failed",
      message: err.message,
    });
  }
});


router.get("/preview/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead || !lead.generated_html_code) {
      return res.status(404).send("Site not found");
    }

    const fullPage = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${lead.generated_css_code}</style>
        </head>
        <body>
          ${lead.generated_html_code}
        </body>
      </html>
    `;

    res.send(fullPage);

  } catch (err) {
    res.status(500).send("Error loading site");
  }
});

const QuoteItemsSchema = z.object({
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      price: z.number(),
    })
  ),
  scope: z.string(),
});

/* -------------------------------------------
   GENERATE QUOTE ITEMS (AI)
------------------------------------------- */
router.post("/generate-quote-items", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    const { projectType, totalPrice, duration } = req.body;

    if (!projectType || !totalPrice) {
      return res.status(400).json({ error: "Project type and price required" });
    }

    const prompt = `
You are a professional project manager and business strategist.

Input:
- Project Type: ${projectType}
- Total Price: ${totalPrice}
- Duration: ${duration || "Not specified"} days

Task:
1. Split the Total Price into 4-6 logical project phases (line items).
2. The sum of all item prices MUST exactly equal the Total Price: ${totalPrice}.
3. Generate a professional "Project Scope & Deliverables" note.

STRICT RULES:
- Output ONLY valid JSON
- No markdown, no explanation
- No code block symbols

FORMAT:
{
  "items": [
    { "description": string, "quantity": 1, "price": number }
  ],
  "scope": string
}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            responseMimeType: "application/json"
          }
        }),
      }
    );

    const data = await response.json();
    let rawText = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("")?.trim();

    if (!rawText) throw new Error("AI returned empty result");

    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(rawText);
    QuoteItemsSchema.parse(parsed);

    return res.json(parsed);

  } catch (err) {
    console.error("AI Quote Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
