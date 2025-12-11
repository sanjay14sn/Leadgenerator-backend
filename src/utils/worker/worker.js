export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname;              // rajwash.iqsync.in
    const path = url.pathname;                  // "/", "/api/..."

    // Extract subdomain
    const sub = hostname.replace(".iqsync.in", "");

    // 1) Backend API proxy
    if (path.startsWith("/api/")) {
      const backendURL = "https://leadgenerator-backend-production.up.railway.app" + path;

      const apiRes = await fetch(backendURL, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" ? await request.text() : undefined,
      });

      return new Response(apiRes.body, {
        status: apiRes.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE",
        }
      });
    }

    // 2) Serve website from KV
    const kvKey = `sites:${sub}`;        // key example: "sites:rajwash"

    const html = await env.SITES.get(kvKey);

    if (!html) {
      return new Response("Website not found", { status: 404 });
    }

    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });
  }
};
