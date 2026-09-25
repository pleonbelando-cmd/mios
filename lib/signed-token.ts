import { createHmac, timingSafeEqual } from "node:crypto";
function mac(purpose: string, payload: string) {
  const secret = process.env.COUPON_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32)
    throw new Error("Signing secret unavailable");
  return createHmac("sha256", secret)
    .update(purpose + ":" + payload)
    .digest("base64url");
}
export function signToken(purpose: string, payload: unknown) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return encoded + "." + mac(purpose, encoded);
}
export function readSignedToken(purpose: string, token: string): unknown {
  if (token.length > 6000 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token))
    throw new Error("Invalid token");
  const [encoded, signature] = token.split(".");
  if (
    !timingSafeEqual(Buffer.from(signature), Buffer.from(mac(purpose, encoded)))
  )
    throw new Error("Invalid signature");
  return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
}
