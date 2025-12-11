import express from "express";
import fetch from "node-fetch";

const router = express.Router();

function safeJSON(text) {
  if (!text) return null;

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

router.post("/enhance", async (req, res) => {
  try {
    const { lead } = req.body;

    const prompt = `
You are a professional website content generator.

Using the following business details, CREATE high-quality website content.

🚀 IMPORTANT RULES:
- ALL fields must be filled with meaningful content.
- NEVER return empty strings.
- ALWAYS return valid JSON.
- Include 3 strong image prompts suitable for AI image generation.

Return JSON ONLY in this EXACT format:

{
  "hero_title": "string",
  "hero_subtitle": "string",
  "description": "string",
  "cta_title": "string",
  "cta_button": "string",
  "testimonials": [
    {
      "name": "string",
      "quote": "string"
    }
  ],
  "images": [
    { "prompt": "string describing hero banner", "style": "string style" },
    { "prompt": "string describing inside view or service", "style": "string style" },
    { "prompt": "string describing brand vibe", "style": "string style" }
  ]
}

Business details:InstagramLead.js
${JSON.stringify(lead, null, 2)}
`;

    const apiKey = process.env.OPENROUTER_API_KEY;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const json = await response.json();
    const text = json?.choices?.[0]?.message?.content;

    console.log("📥 Raw AI:", text);

    const enhanced = safeJSON(text);
    if (!enhanced) {
      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw: text
      });
    }

    res.json({ enhanced });

  } catch (err) {
    console.error("❌ AI Enhance Error:", err.message);
    res.status(500).json({ error: "AI failed" });
  }
});

export default router;
