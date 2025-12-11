// src/utils/subdomainGenerator.js

export function generateSubdomain(name) {
  if (!name) return "site-" + Date.now();

  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")   // replace spaces & symbols with "-"
    .replace(/-+/g, "-")          // remove duplicate hyphens
    .replace(/^-|-$/g, "");       // trim hyphens
}
