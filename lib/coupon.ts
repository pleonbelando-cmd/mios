import { createHmac, timingSafeEqual } from "crypto";

export type CouponLine = {
  ticker: string;
  brand: string;
  tierLabel: string | null;
  discountPct: number;
};

export type CouponPayload = {
  wallet: string;
  lines: CouponLine[];
  timestamp: number; // unix seconds
};

const MAX_AGE_SECONDS = 24 * 60 * 60;

function sign(payloadJson: string): string {
  const secret = process.env.COUPON_SECRET;
  if (!secret) throw new Error("COUPON_SECRET no configurada en .env.local");
  return createHmac("sha256", secret).update(payloadJson).digest("base64url");
}

/** Server-only: firma el payload. No importar desde un componente cliente. */
export function createCouponToken(payload: CouponPayload): string {
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadJson).toString("base64url");
  return `${payloadB64}.${sign(payloadJson)}`;
}

export type VerifyResult =
  | { valid: true; payload: CouponPayload }
  | { valid: false; reason: string };

/** Server-only: verifica firma + caducidad (24h). */
export function verifyCouponToken(token: string): VerifyResult {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) {
    return { valid: false, reason: "Formato de cupón inválido" };
  }

  let payloadJson: string;
  try {
    payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return { valid: false, reason: "Formato de cupón inválido" };
  }

  let expectedSignature: string;
  try {
    expectedSignature = sign(payloadJson);
  } catch {
    return { valid: false, reason: "Servidor sin COUPON_SECRET configurada" };
  }

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (
    sigBuf.length !== expectedBuf.length ||
    !timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return { valid: false, reason: "Firma inválida: el cupón ha sido manipulado" };
  }

  let payload: CouponPayload;
  try {
    payload = JSON.parse(payloadJson) as CouponPayload;
  } catch {
    return { valid: false, reason: "Payload de cupón corrupto" };
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - payload.timestamp;
  if (ageSeconds > MAX_AGE_SECONDS) {
    return { valid: false, reason: "Cupón caducado (válido 24h desde la compra)" };
  }

  return { valid: true, payload };
}
