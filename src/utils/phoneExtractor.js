export function extractPhoneFromWhatsApp(url = "") {
  if (!url.includes("wa.me")) return null;

  const match = url.match(/wa\.me\/(\d+)/);
  return match ? match[1] : null;
}
