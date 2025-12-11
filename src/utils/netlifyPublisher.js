// src/utils/netlifyPublisher.js
import fetch from "node-fetch";
import crypto from "crypto";

export async function uploadToNetlify({ html, subdomain }) {
  const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
  const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;

  if (!NETLIFY_TOKEN || !NETLIFY_SITE_ID) {
    throw new Error("Missing Netlify environment variables");
  }

  console.log("🚀 Deploying:", subdomain);

  // -------------------------------------
  // 1) Create new deploy
  // -------------------------------------
  const createRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/deploys`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NETLIFY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: subdomain }),
    }
  );

  const deploy = await createRes.json();
  const deployId = deploy.id;

  console.log("📌 New Deploy ID:", deployId);

  // -------------------------------------
  // 2) Register file hashes (sha1)
  // -------------------------------------
  const sha = crypto.createHash("sha1").update(html).digest("hex");

  const files = {
    [`/${subdomain}/index.html`]: sha,
  };

  await fetch(
    `https://api.netlify.com/api/v1/deploys/${deployId}/files`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${NETLIFY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files }),
    }
  );

  // -------------------------------------
  // 3) Upload actual HTML file
  // -------------------------------------
  await fetch(
    `https://api.netlify.com/api/v1/deploys/${deployId}/files/${subdomain}/index.html`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${NETLIFY_TOKEN}`,
        "Content-Type": "text/html",
      },
      body: html,
    }
  );

  console.log("✅ Upload Complete!");

  return `https://${subdomain}.iqsync.in`;
}
