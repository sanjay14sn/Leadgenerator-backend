import fetch from "node-fetch";

export async function publishToCloudflareKV(subdomain, html) {
  const CF_API_TOKEN = process.env.CF_API_TOKEN;
  const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
  const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID;

  if (!CF_API_TOKEN || !CF_ACCOUNT_ID || !CF_KV_NAMESPACE_ID) {
    throw new Error("Missing Cloudflare environment values");
  }
  console.log("🔑 Using KV Namespace:", CF_KV_NAMESPACE_ID);

  if (!subdomain || typeof subdomain !== "string") {
    throw new Error("Invalid subdomain");
  }

  console.log("🚀 Uploading to Cloudflare KV");
  console.log("🌐 Subdomain:", subdomain);

  /**
   * KV KEY RULE
   * - This key must match what your Worker / Pages expects
   * - We store HTML under the subdomain name
   */
  const kvKey = `sites:${subdomain}`;

  console.log("📦 KV Key:", kvKey);

  const kvApiUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(
    kvKey
  )}`;

  console.log("🌍 KV API URL:", kvApiUrl);

  const response = await fetch(kvApiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "text/html; charset=utf-8",
    },
    body: html,
  });

  const responseText = await response.text();
  console.log("📨 Cloudflare Raw Response:", responseText);

  if (!response.ok) {
    throw new Error(
      `Cloudflare KV upload failed (${response.status}): ${responseText}`
    );
  }

  console.log("✅ Cloudflare KV Upload SUCCESS");

  /**
   * IMPORTANT:
   * Cloudflare KV does NOT return a site URL.
   * Your domain routing decides this.
   */
  const siteUrl = `https://${subdomain}.iqsync.in`;

  console.log("🔗 Final Website URL:", siteUrl);

  return siteUrl;
}
