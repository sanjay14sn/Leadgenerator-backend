import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

/**
 * Smart Parser for AI Responses (Handles Markers + Markdown Fallback)
 */
function extractHTMLCSS(text) {
    let htmlMatch = text.match(/===\s*HTML\s*===([\s\S]*?)===\s*CSS\s*===/i);
    let cssMatch = text.match(/===\s*CSS\s*===([\s\S]*)/i);

    let html = htmlMatch ? htmlMatch[1].trim() : null;
    let css = cssMatch ? cssMatch[1].trim() : null;

    if (!html || !css) {
        const htmlBlock = text.match(/```html\s*([\s\S]*?)```/i);
        const cssBlock = text.match(/```css\s*([\s\S]*?)```/i);

        if (htmlBlock) html = htmlBlock[1].trim();
        if (cssBlock) css = cssBlock[1].trim();

        if (htmlBlock && !cssBlock) css = "";
    }

    if (!html) {
        console.error("🔥 PARSING FATAL ERROR. Here is what the AI actually wrote:\n");
        console.error("--------------------------------------------------");
        console.error(text);
        console.error("--------------------------------------------------");
        console.warn("⚠️ AI returned invalid format. Retrying fallback template...");

        return {
            html: `<div style="padding:40px;font-family:Inter">
        <h1>${lead.name}</h1>
        <p>Professional website coming soon.</p>
        <a href="tel:${lead.phone}">Call Now</a>
      </div>`,
            css: ""
        };
    }

    return { html, css: css || "" };
}

/**
 * Get image from Pexels → Pixabay → Pollinations fallback
 */
let lastPollinationCall = 0;

async function getImage(query) {
    try {
        if (process.env.PEXELS_API_KEY) {
            const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
                headers: { Authorization: process.env.PEXELS_API_KEY }
            });
            const data = await res.json();
            if (data?.photos?.[0]?.src?.large) return data.photos[0].src.large;
        }

        if (process.env.PIXABAY_API_KEY) {
            const res = await fetch(`https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${query}&image_type=photo&per_page=3`);
            const data = await res.json();
            if (data?.hits?.[0]?.largeImageURL) return data.hits[0].largeImageURL;
        }

        const now = Date.now();
        if (now - lastPollinationCall < 1000) {
            return `https://via.placeholder.com/800x600?text=${encodeURIComponent(query)}`;
        }

        lastPollinationCall = now;
        return `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=800&height=600&nologo=true`;

    } catch (err) {
        return `https://via.placeholder.com/800x600?text=${encodeURIComponent(query)}`;
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
        if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured.");

        const themes = {
            "Medical": { primary: "#2563eb", secondary: "#f0f9ff", accent: "#06b6d4", font: "Inter" },
            "Luxury": { primary: "#b45309", secondary: "#1e1b4b", accent: "#fbbf24", font: "Playfair Display" },
            "Tech": { primary: "#8b5cf6", secondary: "#0f172a", accent: "#06b6d4", font: "JetBrains Mono" },
            "Food": { primary: "#ea580c", secondary: "#fffedd", accent: "#84cc16", font: "Poppins" },
            "Default": { primary: "#1ABC9C", secondary: "#0f172a", accent: "#34D399", font: "Plus Jakarta Sans" }
        };

        const theme = themes[lead.category] || themes["Default"];
        const designStyles = [
            "Neo-Brutalism: Bold typography, high contrast, solid dark borders.",
            "Glassmorphism: Frosted glass effects, subtle gradients, floating cards.",
            "Minimalist Elegance: Massive white space, ultra-thin borders.",
            "Dark Mode Sleek: Deep obsidian backgrounds, neon glowing accents."
        ];
        const randomStyle = designStyles[Math.floor(Math.random() * designStyles.length)];

        const heroImage = await getImage(`${lead.category} hero professional`);
        const contentImage = await getImage(`${lead.category} professional clean`);

        const mapQuery = encodeURIComponent(lead.address || lead.name || "India");
        const mapIframeUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

        // ✅ FORMAT PHONE FOR WHATSAPP (ENSURE 91 PREFIX FOR INDIA)
        let whatsappPhone = lead.phone.replace(/\D/g, "");
        if (whatsappPhone.startsWith("0") && whatsappPhone.length === 11) whatsappPhone = whatsappPhone.substring(1);
        if (whatsappPhone.length === 10) whatsappPhone = "91" + whatsappPhone;

        const prompt = `
You are a Senior Creative Developer. Build a UNIQUE, high-end website for: ${lead.name}.

STRICT FORMAT:
Return output in this EXACT format:

===HTML===
[HTML HERE]

===CSS===
[CSS HERE]

No markdown. No explanations.
The very first line of your HTML MUST be: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
CRITICAL: DO NOT STOP GENERATING. You must write the complete HTML and the complete CSS.

MANDATORY SECTIONS (IN ORDER & WITH ID ATTRIBUTES FOR SCROLLING):
0. NAVBAR: Sticky top bar. Prominently display "${lead.name}" on the left as the logo text. Include a mobile hamburger icon on the right. Links MUST be <a href="#about">, <a href="#services">, <a href="#contact">.
1. HERO (id="hero"): Full screen (100vh) with background image, dark overlay, headline, and 2 CTA buttons. Use EXACTLY this image: ${heroImage}
2. KEY STATS: 4 impressive metrics.
3. ABOUT US (id="about"): Compelling narrative. MUST include EXACTLY this image: <img src="${contentImage}" alt="About Us" />
4. SERVICES (id="services"): Modern Grid showing exactly 4 services. 
   - ABSOLUTELY NO <img> tags.
   - Use FontAwesome HTML tags ONLY (e.g., <i class="fas fa-chart-line"></i>). Make the icons large and use the accent color.
5. TESTIMONIALS: 3 high-quality customer reviews.
6. CONTACT & MAP (id="contact"): Include the exact Google Map iframe below.
7. FOOTER: Multi-column professional footer.
// (keeping everything same above)

8. FLOATING CONTACT BUTTONS: MUST include two fixed, hovering/floating buttons on the bottom right of the screen. Ensure they have high z-index.
   - WhatsApp EXACTLY: <a href="https://wa.me/${whatsappPhone}" class="floating-btn wa-btn"><i class="fab fa-whatsapp"></i></a>
   - Phone EXACTLY: <a href="tel:${lead.phone}" class="floating-btn phone-btn"><i class="fas fa-phone"></i></a>

DESIGN SYSTEM & FIXES:
- Style: ${randomStyle}
- Theme Colors: strictly base the CSS on Primary (${theme.primary}), Surface (${theme.secondary}), and Accent (${theme.accent}).
- Font: ${theme.font} (Import from Google Fonts)
- CSS Reset: MUST include * { margin: 0; padding: 0; box-sizing: border-box; }
- Smooth Scrolling: MUST include html { scroll-behavior: smooth; }
- Mobile Responsiveness: MUST use @media (max-width: 768px) to stack grids and collapse navbar.

MAP IFRAME (USE EXACTLY):
<iframe width="100%" height="400" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${mapIframeUrl}"></iframe>

BUSINESS:
Name: ${lead.name} | Category: ${lead.category} | Phone: ${lead.phone} | Address: ${lead.address}
Description: ${lead.description}
Instructions: ${instructions}
`;
        const models = [
            "gemini-2.5-flash-lite",

        ];

        let rawText = "";

        for (const model of models) {
            for (let attempt = 1; attempt <= 4; attempt++) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

                    const response = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 8192 // Max limit for standard API calls
                            }
                        })
                    });

                    const data = await response.json();

                    if (!data?.candidates || data.candidates.length === 0) {
                        console.warn(`⚠️ ${model} returned empty candidates`);
                        continue;
                    }

                    const candidate = data.candidates[0];
                    const finishReason = candidate?.finishReason;
                    const generatedText = candidate?.content?.parts?.[0]?.text?.trim();

                    if (!generatedText) {
                        console.warn(`⚠️ ${model} returned empty text`);
                        continue;
                    }

                    if (finishReason === "SAFETY") {
                        console.warn(`⚠️ Attempt ${attempt} with ${model} blocked by safety`);
                        continue;
                    }

                    // STRICT VALIDATION: Must be long enough AND contain both HTML and CSS markers
                    const hasHTML = generatedText.includes("===HTML===") || generatedText.toLowerCase().includes("```html");
                    const hasCSS = generatedText.includes("===CSS===") || generatedText.toLowerCase().includes("```css");
                    const isLongEnough = generatedText.length > 4000; // A real site will be 6000-10000+ chars

                    const isValid =
                        generatedText &&
                        generatedText.length > 5000 &&
                        generatedText.includes("===HTML===") &&
                        generatedText.includes("===CSS===") &&
                        generatedText.includes("<section") &&
                        generatedText.includes("@media") &&
                        generatedText.includes("floating-btn");

                    if (isValid) {
                        rawText = generatedText;
                        break;
                    } else {
                        console.warn(`⚠️ Attempt ${attempt} failed | Model: ${model} | Truncated Length: ${generatedText.length}`);
                    }

                } catch (err) {
                    console.warn(`⚠️ Network error ${model}: ${err.message}`);
                }
            }

            if (rawText) break; // If we got good text, skip remaining models
        }
        if (!rawText) throw new Error("Generation failed or continually truncated across all models.");

        console.log("RAW AI RESPONSE LENGTH:", rawText.length);

        const parsed = extractHTMLCSS(rawText);

        let cleanHTML = parsed.html;
        if (cleanHTML.toLowerCase().includes("<body")) {
            cleanHTML = cleanHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || cleanHTML;
        }

        const finalHTML = `
<style>
${parsed.css}
</style>
${cleanHTML}
`.trim();

        return {
            html: finalHTML,
            css: parsed.css
        };
    } catch (err) {
        console.error("🔥 ERROR:", err.message);
        throw err;
    }
}