import crypto from "crypto";

export function generateJWT(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

export function verifyJWT(token, secret) {
  const [header, body, signature] = token.split(".");

  const checkSig = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");

  if (signature !== checkSig) return null;

  return JSON.parse(Buffer.from(body, "base64url").toString());
}
