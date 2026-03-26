import fetch from "node-fetch";
import cloudinary from "../config/cloudinary.js";

export async function generateAndUploadImage(prompt, style = "cute pastel illustration") {
  try {
    // 1️⃣ GENERATE IMAGE USING GEMINI 2.0 FLASH
    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateImage?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: {
            text: `${prompt}. Style: ${style}. High quality, soft colors, kids-safe.`,
          },
          // You can increase count if you want multiple images
          imageGenerationConfig: {
            numberOfImages: 1,
            quality: "high",
            width: 1024,
            height: 1024,
          },
        }),
      }
    );

    const result = await aiRes.json();

    if (!result?.images?.[0]?.data) {
      console.error("❌ Gemini did not produce an image:", result);
      return "";
    }

    const imageBase64 = result.images[0].data; // BASE64 PNG

    // 2️⃣ UPLOAD TO CLOUDINARY
    const uploadRes = await cloudinary.uploader.upload(
      `data:image/png;base64,${imageBase64}`,
      { folder: "leadgen_ai" }
    );

    return uploadRes.secure_url;
  } catch (err) {
    console.error("❌ Gemini Image Error:", err);
    return "";
  }
}
