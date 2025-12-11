// src/utils/subdomainGenerator.js
export function generateSubdomain(name) {
  if (!name) return "site-" + Date.now();

  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
