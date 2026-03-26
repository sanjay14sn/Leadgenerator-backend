import fetch from 'node-fetch';

const PORT = 5024;
const BASE_URL = `http://localhost:${PORT}/api/ai`;

const leadData = {
    name: "Pumo Technovation",
    category: "Software training institute",
    description: "Coimbatore for Cad, Full Stack Developer, Embedded, Automotive, Mechanical Design Course, Java, Python. Located at 3rd Floor, Indian bank building, Sathy Rd, Ramanandha Nagar, Saravanampatti, Coimbatore, Tamil Nadu 641035, India.",
    phone: "096006 00263",
    address: "3rd Floor, Indian bank building, Sathy Rd, Ramanandha Nagar, Saravanampatti, Coimbatore, Tamil Nadu 641035, India",
    user: "64ed7b000000000000000000" // Dummy ObjectId
};

const run = async () => {
    console.log("🚀 Step 1: Enhancing content...");
    const enhanceRes = await fetch(`${BASE_URL}/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead: leadData })
    });

    const enhanceData = await enhanceRes.json();
    if (enhanceData.error) {
        console.error("❌ Enhancement failed:", enhanceData.error);
        return;
    }

    const enhanced = enhanceData.enhanced;
    console.log("✅ Content enhanced!");
    console.log("Headline:", enhanced.hero_title);

    console.log("\n🚀 Step 2: Generating site code...");
    const genRes = await fetch(`${BASE_URL}/generate-site-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            lead: {
                ...leadData,
                hero_title: enhanced.hero_title,
                hero_subtitle: enhanced.hero_subtitle,
                description: enhanced.description,
                cta_title: enhanced.cta_title,
                cta_button: enhanced.cta_button,
                testimonials: enhanced.testimonials,
                images: enhanced.images,
                generated_images: enhanced.generated_images
            },
            instructions: "Make it a premium software training institute landing page with a modern, high-tech industrial aesthetic. Use deep blues, emerald greens, and high contrast."
        })
    });

    const genData = await genRes.json();
    if (genData.error) {
        console.error("❌ Site generation failed:", genData.error, genData.message);
        return;
    }

    console.log("\n✅ Site generated successfully!");
    console.log("🆔 Lead ID:", genData.leadId);
    console.log("🌐 Preview URL:", genData.previewUrl);
};

run();







import fetch from "node-fetch";

/**
 * Safe JSON Parser for AI Responses
 * Handles truncation and unescaped characters in a non-destructive way.
 */
function safeParseAIResponse(text) {
    let raw = text.trim();

    // 1. Basic attempt
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.warn("⚠️ Standard JSON parse failed. Attempting repair...");
    }

    // 2. Repair Truncation (Common in long AI responses)
    if (!raw.endsWith("}")) {
        console.log("🛠 Detected truncation, attempting to close JSON...");
        if (raw.includes('"css":') && !raw.includes('}')) {
            raw += ' " }';
        } else if (raw.includes('"html":') && !raw.includes('"css":')) {
            raw += '", "css": "" }';
        } else {
            raw += ' }';
        }
    }

    // 3. Selective Escaping (Only inside property values)
    try {
        return JSON.parse(raw);
    } catch (err) {
        try {
            // Fix unescaped quotes inside the known structure
            let fixed = raw.replace(/"html":\s*"([\s\S]*?)",\s*"css":/g, (_, html) => {
                const safe = html.replace(/"/g, '\\"').replace(/\\\\"/g, '\\"');
                return `"html":"${safe}","css":`;
            });
            return JSON.parse(fixed);
        } catch (err2) {
            console.error("🔥 JSON Repair failed:", err2.message);
            throw new Error("AI returned invalid JSON structure");
        }
    }
}

/**
 * Generates a unique, high-converting website using Gemini.
 */
export async function generateSiteCode(
    lead,
    instructions = "Make it modern, premium, high-converting."
) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY not configured. Please set it in your environment variables.");
        }

        console.log("=======================================");
        console.log("🎨 SITE CODE GENERATION STARTED");
        console.log("Business:", lead.name);
        console.log("Category:", lead.category);
        console.log("=======================================");

        // 1. DYNAMIC THEMING: Base colors on category
        const themes = {
            "Medical": { primary: "#2563eb", secondary: "#f0f9ff", accent: "#06b6d4", font: "'Inter', sans-serif" },
            "Luxury": { primary: "#b45309", secondary: "#1e1b4b", accent: "#fbbf24", font: "'Playfair Display', serif" },
            "Tech": { primary: "#8b5cf6", secondary: "#0f172a", accent: "#06b6d4", font: "'JetBrains Mono', monospace" },
            "Food": { primary: "#ea580c", secondary: "#fffedd", accent: "#84cc16", font: "'Poppins', sans-serif" },
            "Default": { primary: "#1ABC9C", secondary: "#0f172a", accent: "#34D399", font: "'Plus Jakarta Sans', sans-serif" }
        };

        const theme = themes[lead.category] || themes["Default"];

        // 2. DYNAMIC STYLES: Force UI variety to prevent template fatigue
        const designStyles = [
            "Neo-Brutalism: Bold typography, high contrast, solid dark borders, slightly offset drop shadows.",
            "Glassmorphism: Frosted glass effects (backdrop-filter: blur), subtle gradients, floating cards.",
            "Minimalist Elegance: Massive white space, ultra-thin borders, monochromatic base with a single pop of color.",
            "Dark Mode Sleek: Deep obsidian backgrounds, neon glowing accents, highly futuristic."
        ];
        const randomStyle = designStyles[Math.floor(Math.random() * designStyles.length)];

        // 3. DYNAMIC ASSETS: Generate specific Unsplash keywords
        const imageSearchTerm = encodeURIComponent(`${lead.category} professional business interior`);

        /* ------------------ ENHANCED PROMPT ------------------ */

        const prompt = `
You are a Senior Creative Developer. Build a UNIQUE, high-end website for: ${lead.name}.

STRICT FORMAT:
- Return ONLY valid JSON
- No markdown formatting blocks (\`\`\`json)
- Format: { "html": "Interior content of the <body> tag only", "css": "All CSS styles" }
- Ensure all quotes inside properties are escaped.

DESIGN SYSTEM (STRICT):
- Base Style to apply: ${randomStyle}
- Primary Color: ${theme.primary}
- Dark/Light Surface: ${theme.secondary}
- Accent: ${theme.accent}
- Typography: ${theme.font} (Import this from Google Fonts in the CSS)

UNIQUE UI REQUIREMENTS:
1. LAYOUT: Use a modern bento-style grid layout for the "Services" or "About" section.
2. MICRO-INTERACTIONS: Every button and card must have a unique hover scale/glow effect.
3. SCROLL REVEAL: Implement CSS-only scroll animations using '@keyframes' and 'animation timeline' if possible, or simple fade-ins.
4. HERO SECTION: Do NOT use a standard center-align. Try a split-screen or asymmetrical layout. Full screen (100vh).

DYNAMIC ASSETS:
- Hero Image: https://source.unsplash.com/featured/1600x900?${imageSearchTerm},luxury
- Gallery Images: Use https://source.unsplash.com/featured/800x600?${imageSearchTerm},work&sig=[random_1_to_10]

CONTENT STRATEGY:
- Write punchy, conversion-focused copy based on this context: ${lead.description}
- Floating CTA Buttons: WhatsApp + Call using phone: ${lead.phone}
- Map URL: http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(lead.address)}&output=embed

----------------------------------
BUSINESS DETAILS:
Name: ${lead.name}
Category: ${lead.category}
Phone: ${lead.phone}
Address: ${lead.address}
Custom Instructions: ${instructions}
----------------------------------

Final Instruction: Avoid "Template" looks. Push the boundaries of modern CSS.
`;

        /* ------------------ MODEL FALLBACK LOOP ------------------ */

        // Keeping your original model array structure intact
        const models = [
            "gemini-2.1-flash", // Re-ordering for stability
            "gemini-1.5-flash",
            "gemini-flash-latest",
        ];

        let rawText = "";

        for (const model of models) {
            try {
                console.log(`🤖 Trying model: ${model}... (Style: ${randomStyle.split(':')[0]})`);

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-goog-api-key": process.env.GEMINI_API_KEY,
                        },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature: 0.7, // Higher temp for more creative layouts
                                maxOutputTokens: 8192,
                                responseMimeType: "application/json",
                            },
                        }),
                    }
                );

                const data = await response.json();

                if (data.error) {
                    console.error("❌ Model Error:", model, data.error.message);
                    continue;
                }

                const candidate = data?.candidates?.[0];
                rawText = candidate?.content?.parts?.map((p) => p.text).join("")?.trim();

                if (!rawText) {
                    console.warn("⚠️ Empty response from:", model);
                    continue;
                }

                console.log("✅ Success with:", model);
                break;
            } catch (err) {
                console.warn("⚠️ API Call failed for model:", model, err.message);
                continue;
            }
        }

        /* ------------------ VALIDATION & RECOVERY ------------------ */

        if (!rawText) {
            throw new Error("All models failed or returned empty responses.");
        }

        // Cleanup potential markdown blocks if AI ignored responseMimeType
        rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

        let parsed;
        try {
            parsed = safeParseAIResponse(rawText);
        } catch (err) {
            console.error("🔥 JSON PARSE ERROR. Raw text snippet:", rawText.substring(0, 200) + "...");
            throw new Error("Invalid JSON returned by AI after repair attempts.");
        }

        if (!parsed.html || !parsed.css) {
            throw new Error("AI response is missing 'html' or 'css' keys.");
        }

        // RECOVERY: Extract interior body content if AI wrapped it in <html>
        if (parsed.html.toLowerCase().includes("<body")) {
            console.log("🛠 AI returned full HTML document, extracting body content...");
            const bodyMatch = parsed.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (bodyMatch) {
                parsed.html = bodyMatch[1];
            }
        } else if (parsed.html.toLowerCase().includes("<html")) {
            parsed.html = parsed.html.replace(/<\/?html[^>]*>/gi, "").replace(/<\/?head[^>]*>([\s\S]*?)<\/head>/gi, "");
        }

        console.log("🎉 SITE GENERATED SUCCESSFULLY");
        return parsed;

    } catch (err) {
        console.error("🔥 GENERATE SITE ERROR:", err.message);
        throw err;
    }
}