import fetch from "node-fetch";

export async function publishToCloudflareKV(subdomain, html) {
  const CF_API_TOKEN = process.env.CF_API_TOKEN;
  const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
  const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID;

  if (!CF_API_TOKEN || !CF_ACCOUNT_ID || !CF_KV_NAMESPACE_ID) {
    throw new Error("Missing Cloudflare environment values");
  }

  console.log("🚀 Uploading to Cloudflare KV:", subdomain);

  const key = `${subdomain}/index.html`;

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;

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
  return `https://${subdomain}.iqsync.in`;
}
