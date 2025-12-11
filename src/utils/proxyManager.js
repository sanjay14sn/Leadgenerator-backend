export function getRandomProxy() {
  const raw = process.env.PROXIES;

  if (!raw || raw.trim() === "") {
    return null;
  }

  const list = raw.split(",").map(p => p.trim()).filter(Boolean);

  if (list.length === 0) return null;

  return list[Math.floor(Math.random() * list.length)];
}
