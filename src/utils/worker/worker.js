export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;              // subdomain.iqsync.in
    const path = url.pathname;                  // "/"

    // Extract subdomain (remove .iqsync.in and handle potential port/staging)
    const sub = hostname.replace(".iqsync.in", "").split(":")[0];

    // 1) Backend API proxy
    if (path.startsWith("/api/")) {
      const backendURL = "https://api.iqsync.in" + path;
      return fetch(new Request(backendURL, request));
    }

    // 2) Serve website from KV
    const kvKey = `sites:${sub}`;
    const html = await env.SITES.get(kvKey);

    if (!html) {
      return new Response("Website not found", { status: 404 });
    }

    // 3) Tracking (Non-blocking)
    const userAgent = (request.headers.get("User-Agent") || "").toLowerCase();
    const isBot = /bot|spider|crawl|slurp|facebookexternalhit|whatsapp|bingbot|googlebot/i.test(userAgent);

    // Only track root page hits for real users
    if (path === "/" && !isBot && sub && sub !== "api" && sub !== "www") {
      ctx.waitUntil(
        fetch("https://api.iqsync.in/api/leads/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subdomain: sub })
        }).catch(err => console.error("Tracking failed:", err))
      );
    }

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "X-Tracking": !isBot ? "queued" : "skipped"
      }
    });
  }
};
