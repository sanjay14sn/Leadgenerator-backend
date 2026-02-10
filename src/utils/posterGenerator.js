import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎨 Clean background prompt — NO TEXT inside AI image
const IMAGE_PROMPT =
  "cute and colorful preschool admission poster background, smiling kids playing together, playful kindergarten environment, balloons and toys, pastel colors, friendly cartoon illustration style, rounded soft shapes, clean minimal layout, soft lighting, nursery school theme, high quality, poster background, no text, no letters, no watermark, high resolution";

const OUT_DIR = path.join(__dirname, "../posters");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const escapeXml = (unsafe) => {
  if (!unsafe) return "";
  return unsafe.toString().replace(/[<>&\"']/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return c;
    }
  });
};

/* ================== HUGGINGFACE ================== */
async function hfImage(prompt) {
  const res = await axios.post(
    "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
    { inputs: prompt },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "image/png",
      },
      responseType: "arraybuffer",
      timeout: 60000,
    }
  );
  return Buffer.from(res.data);
}

/* ================== POLLINATIONS (Fallback) ================== */
async function pollinationsImage() {
  const cleanUrlPrompt = encodeURIComponent(
    "cute preschool colorful kids playing poster background, cartoon, soft pastel colors, no text"
  );
  const seed = Math.floor(Math.random() * 100000);

  const url = `https://image.pollinations.ai/prompt/${cleanUrlPrompt}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true`;

  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 60000,
  });

  return Buffer.from(res.data);
}

/* ================== MAIN ================== */
export async function generatePoster(name = "", location = "", phone = "") {
  console.log(`\n🎨 Generating poster for: ${name}`);

  let buffer = null;

  try {
    console.log("🟢 Attempting HuggingFace (Router)...");
    buffer = await hfImage(IMAGE_PROMPT);
    console.log("✅ HF success");
  } catch (err) {
    console.log(
      "⚠️ HF failed. Error details:",
      err.response?.data
        ? Buffer.from(err.response.data).toString()
        : err.message
    );

    try {
      console.log("🟡 Switching to Pollinations (Free Backup)…");
      buffer = await pollinationsImage();
      console.log("✅ Pollinations success");
    } catch (pErr) {
      console.log("❌ All services failed:", pErr.message);
      throw new Error("Poster image generation failed.");
    }
  }

  const output = path.join(OUT_DIR, `poster-${Date.now()}.png`);

  // Escape text for SVG
  const sName = escapeXml(name);
  const sLoc = escapeXml(location);
  const sPhone = escapeXml(phone);

  // 🧾 Create final poster with text overlay
  await sharp(buffer)
    .resize(1024, 1024)
    .composite([
      {
        input: Buffer.from(`
          <svg width="1024" height="1024">
            <style>
              .header { fill:#FF7A00; font-size:48px; font-weight:900; font-family:Arial, sans-serif; }
              .title { fill:#111; font-size:40px; font-weight:800; font-family:Arial, sans-serif; }
              .txt { fill:#333; font-size:28px; font-weight:500; font-family:Arial, sans-serif; }
              .badge { fill:#ff1744; }
              .badge-text { fill:#fff; font-size:26px; font-weight:900; font-family:Arial, sans-serif; text-transform:uppercase; }
            </style>

            <!-- Admission Open badge -->
            <rect x="40" y="40" rx="20" ry="20" width="260" height="70" class="badge"/>
            <text x="170" y="88" text-anchor="middle" class="badge-text">Admission Open</text>

            <!-- White footer panel -->
            <rect x="0" y="720" width="1024" height="304" fill="white" fill-opacity="0.92"/>

            <text x="512" y="800" text-anchor="middle" class="header">Play School</text>
            <text x="512" y="860" text-anchor="middle" class="title">${sName}</text>
            <text x="512" y="915" text-anchor="middle" class="txt">📍 ${sLoc}</text>
            <text x="512" y="965" text-anchor="middle" class="txt">📞 ${sPhone}</text>
          </svg>
        `),
        top: 0,
        left: 0,
      },
    ])
    .toFile(output);

  console.log("🎉 Poster created successfully:", output);
  return output;
}
