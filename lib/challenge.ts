import { createPublicKey, randomBytes, verify } from "node:crypto";
import { PublicKey } from "@solana/web3.js";
import { findAssetByTicker } from "./assets";
import { ApiError } from "./api-errors";
import { readSignedToken, signToken } from "./signed-token";
export type Challenge = {
  version: 1;
  domain: string;
  wallet: string;
  tickers: string[];
  nonce: string;
  issuedAt: number;
  expiresAt: number;
};
export function parseWallet(value: unknown): string {
  try {
    if (typeof value !== "string" || value.length > 44) throw new Error();
    const key = new PublicKey(value);
    if (!PublicKey.isOnCurve(key.toBytes()) || key.toBase58() !== value)
      throw new Error();
    return value;
  } catch {
    throw new ApiError(400, "La dirección de wallet no es válida.");
  }
}
export function parseTickers(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    !value.length ||
    value.length > 5 ||
    value.some((t) => typeof t !== "string" || !findAssetByTicker(t)) ||
    new Set(value).size !== value.length
  ) {
    throw new ApiError(
      400,
      "Selecciona entre uno y cinco activos admitidos, sin repetir.",
    );
  }
  return [...value].sort();
}
export function challengeMessage(c: Challenge) {
  return [
    "MIOS — Cupón de demostración",
    "Dominio: " + c.domain,
    "Wallet: " + c.wallet,
    "Activos: " + c.tickers.join(", "),
    "Nonce: " + c.nonce,
    "Emitido: " + new Date(c.issuedAt * 1000).toISOString(),
    "Caduca: " + new Date(c.expiresAt * 1000).toISOString(),
    "Firmar acredita el control de esta wallet para calcular un beneficio de demostración.",
    "No transfiere fondos, no realiza compras y no autoriza un canje comercial.",
  ].join("\n");
}
export function createChallenge(
  wallet: unknown,
  tickers: unknown,
  domain: string,
  now = Math.floor(Date.now() / 1000),
) {
  const payload: Challenge = {
    version: 1,
    domain,
    wallet: parseWallet(wallet),
    tickers: parseTickers(tickers),
    nonce: randomBytes(16).toString("hex"),
    issuedAt: now,
    expiresAt: now + 300,
  };
  return {
    challenge: signToken("mios-challenge-v1", payload),
    message: challengeMessage(payload),
    expiresAt: payload.expiresAt,
  };
}
export function verifyChallenge(
  token: unknown,
  signature: unknown,
  domain: string,
  now = Math.floor(Date.now() / 1000),
): Challenge {
  try {
    if (
      typeof token !== "string" ||
      typeof signature !== "string" ||
      !/^[A-Za-z0-9+/]{86}==$/.test(signature)
    )
      throw new Error();
    const c = readSignedToken("mios-challenge-v1", token) as Challenge;
    if (
      !c ||
      c.version !== 1 ||
      c.domain !== domain ||
      !/^[a-f0-9]{32}$/.test(c.nonce) ||
      !Number.isSafeInteger(c.issuedAt) ||
      !Number.isSafeInteger(c.expiresAt) ||
      c.expiresAt !== c.issuedAt + 300 ||
      c.issuedAt > now + 30 ||
      c.expiresAt <= now
    )
      throw new Error();
    parseWallet(c.wallet);
    parseTickers(c.tickers);
    // Ed25519 SPKI prefix + Solana's raw 32-byte public key.
    const key = createPublicKey({
      key: Buffer.concat([
        Buffer.from("302a300506032b6570032100", "hex"),
        new PublicKey(c.wallet).toBuffer(),
      ]),
      format: "der",
      type: "spki",
    });
    if (
      !verify(
        null,
        Buffer.from(challengeMessage(c)),
        key,
        Buffer.from(signature, "base64"),
      )
    )
      throw new Error();
    return c;
  } catch {
    throw new ApiError(
      401,
      "La firma no es válida o ha caducado. Vuelve a firmar con tu wallet.",
    );
  }
}
