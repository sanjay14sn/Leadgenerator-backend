import fetch from "node-fetch";

export async function findInstagram(business) {
  try {
    const prompt = `
Find the Instagram ID for the following business.
If exact match is not found, generate 5 most likely usernames.

Return JSON only:
{
  "exact": "",
  "suggestions": []
}

Business:
${JSON.stringify(business, null, 2)}
`;

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Lead Generator AI",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const json = await resp.json().catch(() => null);
    const text = json?.choices?.[0]?.message?.content;

    // 🛑 GUARD: empty or invalid response
    if (!text || text.length < 5) {
      return { exact: "", suggestions: [] };
    }

    // 🛑 GUARD: safe JSON parse
    try {
      return JSON.parse(text);
    } catch {
      return { exact: "", suggestions: [] };
    }
  } catch (e) {
    console.log("Instagram AI error:", e.message);
    return { exact: "", suggestions: [] };
  }
}
