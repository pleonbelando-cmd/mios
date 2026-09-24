import type { CouponLine } from "./coupon";
export type CouponResult = {
  token: string;
  lines: CouponLine[];
  wallet: string;
  issuedAt: number;
  expiresAt: number;
  demo: true;
};
async function post(path: string, body: unknown, signal: AbortSignal) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.any([signal, AbortSignal.timeout(25_000)]),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "No se pudo completar la solicitud.",
    );
  return data;
}
export async function requestCoupon(
  wallet: string,
  tickers: string[],
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  signal: AbortSignal,
  onChecking: () => void,
): Promise<CouponResult> {
  const challenge = await post(
    "/api/coupon/challenge",
    { wallet, tickers },
    signal,
  );
  let signed: Uint8Array;
  try {
    signed = await signMessage(new TextEncoder().encode(challenge.message));
  } catch {
    throw new Error(
      "No se ha firmado el mensaje. Puedes intentarlo de nuevo; no se han movido fondos.",
    );
  }
  if (signal.aborted)
    throw new Error("La wallet ha cambiado. Vuelve a iniciar la solicitud.");
  onChecking();
  const signature = btoa(String.fromCharCode(...signed));
  return post(
    "/api/coupon",
    { challenge: challenge.challenge, signature },
    signal,
  );
}
