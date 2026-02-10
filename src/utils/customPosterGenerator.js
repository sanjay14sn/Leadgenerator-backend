import axios from "axios";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, "../../public/posters");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const escapeXml = (unsafe) =>
  unsafe?.toString().replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c])
  ) || "";

function wrap(text = "", max = 22) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (let w of words) {
    if ((line + w).length >= max) {
      lines.push(line.trim());
      line = "";
    }
    line += w + " ";
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 3);
}

const colorThemes = [
  { badge: "#ff3b30", header: "#ff9500" },
  { badge: "#5856d6", header: "#007aff" },
  { badge: "#34c759", header: "#30b0c7" },
];

async function getPosterBuffer(prompt) {
  try {
    const res = await axios.post(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      { inputs: `${prompt}, high quality background, no text` },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          Accept: "image/png",
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
        timeout: 45000,
      }
    );
    return Buffer.from(res.data);
  } catch (err) {
    console.log("⚠️ HF failed, trying Pollinations...");
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 45000 });
    return Buffer.from(res.data);
  }
}

export async function generateCustomPosters({ prompt, title, subtitle, badge, location, phone }) {
  const posters = [];
  const sTitle = escapeXml(title);
  const sSub = escapeXml(subtitle);
  const sBadge = escapeXml(badge);
  const sLoc = escapeXml(location);
  const sPhone = escapeXml(phone);

  for (let i = 0; i < 3; i++) {
    try {
      const buffer = await getPosterBuffer(prompt);
      const theme = colorThemes[i % colorThemes.length];
      const fileName = `poster-${Date.now()}-${i}.png`;
      const outputPath = path.join(OUT_DIR, fileName);

      const layers = [
        {
          input: Buffer.from(`<svg width="1024" height="1024"><rect width="1024" height="1024" fill="black" fill-opacity="0.1"/></svg>`),
          top: 0, left: 0
        }
      ];

      if (sBadge) {
        layers.push({
          input: Buffer.from(`
            <svg width="350" height="100">
              <rect x="10" y="10" rx="15" width="300" height="60" fill="${theme.badge}"/>
              <text x="160" y="50" text-anchor="middle" style="fill:white;font-size:24px;font-family:Arial;font-weight:bold;">${sBadge}</text>
            </svg>`),
          top: 20, left: 20
        });
      }

      layers.push({
        input: Buffer.from(`
          <svg width="1024" height="350">
            <rect width="1024" height="350" fill="white" fill-opacity="0.95"/>
            ${wrap(sTitle, 20).map((line, idx) => `
              <text x="512" y="${80 + idx * 55}" text-anchor="middle" style="fill:${theme.header};font-size:48px;font-family:Arial;font-weight:900;text-transform:uppercase;">${line}</text>
            `).join('')}
            ${wrap(sSub, 35).map((line, idx) => `
              <text x="512" y="${200 + idx * 35}" text-anchor="middle" style="fill:#444;font-size:28px;font-family:Arial;">${line}</text>
            `).join('')}
            <text x="512" y="300" text-anchor="middle" style="fill:#666;font-size:24px;font-family:Arial;">
              ${sLoc ? `📍 ${sLoc}  ` : ""} ${sPhone ? `📞 ${sPhone}` : ""}
            </text>
          </svg>`),
        top: 674, left: 0
      });

      await sharp(buffer).resize(1024, 1024).composite(layers).toFile(outputPath);
      posters.push(`http://localhost:5010/posters/${fileName}`);
    } catch (err) {
      console.error(`Error on poster ${i}:`, err.message);
    }
  }
  return posters;
}