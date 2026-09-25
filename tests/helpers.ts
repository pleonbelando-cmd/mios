import { generateKeyPairSync, sign } from "node:crypto";
import { PublicKey } from "@solana/web3.js";
import { createChallenge } from "../lib/challenge";
export function wallet() {
  const keys = generateKeyPairSync("ed25519");
  const raw = keys.publicKey
    .export({ format: "der", type: "spki" })
    .subarray(-32);
  return {
    address: new PublicKey(raw).toBase58(),
    sign: (message: string) =>
      sign(null, Buffer.from(message), keys.privateKey).toString("base64"),
  };
}
export function signedRequest(
  owner = wallet(),
  tickers = ["AAPLx"],
  domain = "mios.test",
  at?: number,
) {
  const c = createChallenge(owner.address, tickers, domain, at);
  return {
    owner,
    c,
    body: { challenge: c.challenge, signature: owner.sign(c.message) },
  };
}
export function request(
  body: unknown,
  path = "/api/coupon",
  origin = "https://mios.test",
) {
  return new Request("https://mios.test" + path, {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(body),
  });
}
