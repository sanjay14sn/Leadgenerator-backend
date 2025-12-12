// src/controllers/kvController.js

import fetch from "node-fetch";

// DO NOT DECLARE ACCOUNT_ID, NAMESPACE_ID, TOKEN, or KV_BASE HERE.
// We must declare them inside the functions to ensure process.env is loaded.

// ⭐ CRITICAL FIX: Disable caching for all external API calls
const NO_CACHE_OPTIONS = {
    cache: 'no-store',
};

// Helper function to get the base URL and headers *dynamically*
function getCloudflareConfig() {
    const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
    const NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID;
    const TOKEN = process.env.CF_API_TOKEN;

    if (!ACCOUNT_ID || !NAMESPACE_ID || !TOKEN) {
        console.error("Cloudflare environment variables are missing!");
        // Throw an error early if configuration is truly missing
        throw new Error("Missing Cloudflare Configuration."); 
    }

    const KV_BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}`;
    const HEADERS = {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    };

    return { KV_BASE, HEADERS };
}

/* ---------------------------------------------------------
  1. DELETE ONE WEBSITE FROM KV
--------------------------------------------------------- */
export const deleteSite = async (req, res) => {
  try {
    const { KV_BASE, HEADERS } = getCloudflareConfig();
    const { key } = req.params;

    const url = `${KV_BASE}/values/${key}`;
    const result = await fetch(url, { 
        method: "DELETE", 
        headers: HEADERS,
        ...NO_CACHE_OPTIONS,
    }).then(
      (r) => r.json()
    );

    res.json({ success: true, key, result });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete site" });
  }
};

/* ---------------------------------------------------------
  Helper: Parse mobile number from HTML
--------------------------------------------------------- */
function extractPhone(html) {
  if (!html) return "";
  const match = html.match(/tel:(\+?\d{6,15})/i);
  if (match) return match[1];

  const m2 = html.match(/(\+?\d[\d\s\-]{8,15})/);
  return m2 ? m2[1].replace(/\D/g, "") : "";
}

/* ---------------------------------------------------------
  2. LIST ALL WEBSITES WITH NAME & MOBILE NUMBER (FINAL FIX)
--------------------------------------------------------- */
export const listAllSites = async (req, res) => {
  try {
    const { KV_BASE, HEADERS } = getCloudflareConfig(); // ⭐ GET CONFIG INSIDE FUNCTION
    const listURL = `${KV_BASE}/keys`;
    const listResponse = await fetch(listURL, { 
        headers: HEADERS,
        ...NO_CACHE_OPTIONS, 
    });

    // Check HTTP Status first
    if (!listResponse.ok) {
        const text = await listResponse.text();
        console.error(`Cloudflare API returned non-OK status: ${listResponse.status}`, text);
        return res.status(listResponse.status).json({
            error: "Failed to fetch keys from Cloudflare: Non-OK HTTP Status",
            status: listResponse.status,
            details: text 
        });
    }

    const list = await listResponse.json();

    // Check the 'success' flag in the Cloudflare JSON response
    if (!list.success) {
        console.error("Cloudflare List Keys API Error:", list.errors);
        return res.status(500).json({ 
            error: "Failed to fetch keys from Cloudflare: API Error",
            details: list.errors 
        });
    }

    const keys = list.result || [];
    const results = [];

    // Fetch full HTML for each key
    for (const item of keys) {
      try { 
        const htmlRes = await fetch(
            `${KV_BASE}/values/${item.name}`,
            { 
                headers: HEADERS,
                ...NO_CACHE_OPTIONS, 
            }
        );
        
        if (!htmlRes.ok) {
            console.error(`Failed to fetch value for key ${item.name}. Status: ${htmlRes.status}`);
            continue; 
        }
        
        const html = await htmlRes.text();

        results.push({
          key: item.name,
          phone: extractPhone(html),
          size: item.size,
        });
      } catch (innerErr) {
        console.error(`Error processing key ${item.name}:`, innerErr.message);
        continue;
      }
    }

    res.json(results);
  } catch (err) {
    console.error("List error (unhandled exception):", err);
    res.status(500).json({ error: "Failed to list sites (server crash)" });
  }
};

/* ---------------------------------------------------------
  3. BULK DELETE (FINAL FIX for 405 Method Not Allowed)
--------------------------------------------------------- */
export const bulkDelete = async (req, res) => {
  try {
    // Get configuration dynamically
    const { KV_BASE, HEADERS } = getCloudflareConfig(); 
    const { keys } = req.body; 

    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: "Keys array is required for bulk delete." });
    }

    // ⭐ FIX: Change endpoint from '/keys' to '/bulk'
    const deleteURL = `${KV_BASE}/bulk`;
    
    // Note: Cloudflare's bulk delete requires POST with the DELETE method specified in the body, 
    // BUT for KV, the API accepts a DELETE request with the array of keys in the body 
    // targeting the /bulk endpoint. The current method is correct, but the URL path was wrong.

    const cfRes = await fetch(deleteURL, {
      method: "DELETE",
      headers: HEADERS,
      body: JSON.stringify(keys), 
      ...NO_CACHE_OPTIONS,
    });
    
    // Check for non-200 HTTP status
    if (!cfRes.ok) {
        const text = await cfRes.text();
        console.error(`Cloudflare Bulk Delete returned non-OK status: ${cfRes.status}`, text);
        return res.status(cfRes.status).json({
            error: "Bulk delete failed: Non-OK HTTP Status",
            status: cfRes.status,
            details: text 
        });
    }

    const result = await cfRes.json();

    // Check for success flag in the Cloudflare JSON response
    if (!result.success) {
      console.error("Cloudflare Bulk Delete API Error:", result.errors);
      
      return res.status(500).json({
        error: "Bulk delete failed: Cloudflare API Error",
        details: result.errors,
      });
    }

    res.json({
      success: true,
      deleted: keys.length,
      result: result,
    });
  } catch (err) {
    console.error("Bulk delete error (unhandled exception):", err);
    res.status(500).json({ error: "Bulk delete failed" });
  }
};
/* ---------------------------------------------------------
  4. CREATE SITE (Placeholder)
--------------------------------------------------------- */
export const createSite = async (req, res) => {
  try {
    // Configuration isn't strictly needed here, but kept for consistency
    const { KV_BASE, HEADERS } = getCloudflareConfig(); 
    const { leadId, html } = req.body;

    if (!leadId || !html) {
      return res.status(400).json({ error: "leadId and html required" });
    }

    res.json({
      success: true,
      message: "Site saved (demo response)",
      url: `https://example.com/site/${leadId}`,
    });
  } catch (err) {
    console.error("KV ERROR:", err);
    res.status(500).json({ error: "KV handler failed" });
  }
};