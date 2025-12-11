import fetch from "node-fetch";

export async function publishToCloudflareKV(subdomain, html) {
  const CF_API_TOKEN = process.env.CF_API_TOKEN;
  const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
  const CF_KV_NAMESPACE = process.env.CF_KV_NAMESPACE; // ✅ Correct key name

  // -------------------------------
  // VALIDATE ENV VARIABLES
  // -------------------------------
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID || !CF_KV_NAMESPACE) {
    console.error("❌ ENV Values:", {
      CF_API_TOKEN,
      CF_ACCOUNT_ID,
      CF_KV_NAMESPACE,
    });

    throw new Error("Missing Cloudflare environment values");
  }

  console.log("🚀 Uploading to Cloudflare KV:", subdomain);

  // key = subdomain/index.html
  const key = `${subdomain}/index.html`;

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE}/values/${encodeURIComponent(
    key
  )}`;

  // -------------------------------
  // UPLOAD TO KV
  // -------------------------------
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "text/html",
    },
    body: html,
  });

  const raw = await response.text();

  if (!response.ok) {
    console.log("❌ Cloudflare KV Error:", raw);
    throw new Error("KV Upload failed: " + raw);
  }

  console.log("✅ Cloudflare KV Upload Success");

  // Return your final live URL
  return `https://${subdomain}.iqsync.in`;
}
