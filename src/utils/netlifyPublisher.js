// src/utils/netlifyPublisher.js
import fetch from "node-fetch";

const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID; // Add this in .env

export async function uploadToNetlify({ html, subdomain }) {
  try {
    if (!NETLIFY_TOKEN || !NETLIFY_SITE_ID) {
      throw new Error("Missing Netlify environment variables");
    }

    const filePath = `${subdomain}/index.html`;

    const upload = await fetch(
      `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/files/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${NETLIFY_TOKEN}`,
          "Content-Type": "text/html",
        },
        body: html,
      }
    );

    if (!upload.ok) {
      const errText = await upload.text();
      throw new Error("Netlify Upload Error: " + errText);
    }

    // Return full URL
    const finalUrl = `https://${subdomain}.leadgenwebsites.com`;

    return finalUrl;
  } catch (err) {
    console.error("🔥 Netlify Publish Error:", err);
    throw err;
  }
}
