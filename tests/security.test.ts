import { beforeEach, describe, expect, it, vi } from "vitest";
import { createChallenge, verifyChallenge } from "../lib/challenge";
import {
  createCouponToken,
  verifyCouponToken,
  type CouponPayload,
} from "../lib/coupon";
import { issueCoupon } from "../lib/issue-coupon";
import { getPortfolioHoldings } from "../lib/holdings";
import { getJupiterPrices } from "../lib/jupiter";
import { SUPPORTED_ASSETS } from "../lib/assets";
import { POST } from "../app/api/coupon/route";
import { POST as challengePOST } from "../app/api/coupon/challenge/route";
import { resolveTier } from "../lib/tiers";
import { signToken } from "../lib/signed-token";
import { request, signedRequest, wallet } from "./helpers";
vi.mock("../lib/holdings", () => ({ getPortfolioHoldings: vi.fn() }));
vi.mock("../lib/jupiter", () => ({ getJupiterPrices: vi.fn() }));
vi.mock("../lib/server-connection", () => ({
  getServerConnection: vi.fn(() => ({})),
}));
beforeEach(() => {
  process.env.COUPON_SECRET = "test-only-secret-with-at-least-32-characters";
  vi.mocked(getPortfolioHoldings).mockResolvedValue(
    SUPPORTED_ASSETS.map((asset) => ({
      asset,
      uiAmount: asset.ticker === "AAPLx" ? 5 : 20,
    })),
  );
  vi.mocked(getJupiterPrices).mockResolvedValue(
    Object.fromEntries(
      SUPPORTED_ASSETS.map((a) => [
        a.ticker,
        {
          source: "jupiter",
          price: 100,
          fetchedAtMs: Date.now(),
          sourceUpdatedAtMs: Date.now(),
          stale: false,
          stockRef: null,
          stockRefUpdatedAtMs: null,
        },
      ]),
    ),
  );
});
describe("proof of wallet control", () => {
  it("verifies an actual Ed25519 signature", () => {
    const s = signedRequest();
    expect(
      verifyChallenge(s.body.challenge, s.body.signature, "mios.test").wallet,
    ).toBe(s.owner.address);
  });
  it("rejects another wallet's signature", () => {
    const s = signedRequest();
    expect(() =>
      verifyChallenge(
        s.body.challenge,
        wallet().sign(s.c.message),
        "mios.test",
      ),
    ).toThrow();
  });
  it("rejects modified message, domain, token and absent signature", () => {
    const s = signedRequest();
    expect(() =>
      verifyChallenge(
        s.body.challenge,
        s.owner.sign(s.c.message + "changed"),
        "mios.test",
      ),
    ).toThrow();
    expect(() =>
      verifyChallenge(s.body.challenge, s.body.signature, "evil.test"),
    ).toThrow();
    expect(() =>
      verifyChallenge(
        s.body.challenge + ".extra",
        s.body.signature,
        "mios.test",
      ),
    ).toThrow();
    expect(() =>
      verifyChallenge(s.body.challenge, undefined, "mios.test"),
    ).toThrow();
    const [p, sig] = s.body.challenge.split(".");
    const changed = JSON.parse(Buffer.from(p, "base64url").toString());
    changed.tickers = ["NVDAx"];
    const tampered =
      Buffer.from(JSON.stringify(changed)).toString("base64url") + "." + sig;
    expect(() =>
      verifyChallenge(tampered, s.body.signature, "mios.test"),
    ).toThrow();
  });
  it("expires exactly at five minutes and rejects future-issued proofs", () => {
    const at = Math.floor(Date.now() / 1000),
      s = signedRequest(undefined, undefined, undefined, at);
    expect(() =>
      verifyChallenge(
        s.body.challenge,
        s.body.signature,
        "mios.test",
        at + 300,
      ),
    ).toThrow();
    expect(() =>
      verifyChallenge(s.body.challenge, s.body.signature, "mios.test", at - 31),
    ).toThrow();
  });
  it.each([null, "", "not-a-wallet"])("rejects invalid wallet %s", (value) => {
    expect(() => createChallenge(value, ["AAPLx"], "mios.test")).toThrow();
  });
  it.each([
    { tickers: [] },
    { tickers: ["AAPLx", "AAPLx"] },
    { tickers: [null] },
    { tickers: ["SCAM"] },
  ])("rejects invalid tickers $tickers", ({ tickers }) => {
    expect(() =>
      createChallenge(wallet().address, tickers, "mios.test"),
    ).toThrow();
  });
  it("fails closed without a sufficiently long secret", async () => {
    process.env.COUPON_SECRET = "short";
    expect(
      (
        await challengePOST(
          request({ wallet: wallet().address, tickers: ["AAPLx"] }),
        )
      ).status,
    ).toBe(503);
  });
});
describe("server-authoritative eligibility", () => {
  it("calculates multi-asset discounts and signs those exact lines", async () => {
    const s = signedRequest(undefined, ["AAPLx", "NVDAx"]);
    const result = await issueCoupon(s.body, "mios.test");
    expect(result.lines.map((l) => l.discountPct)).toEqual([5, 10]);
    const verified = verifyCouponToken(result.token);
    expect(verified.valid).toBe(true);
    if (verified.valid) expect(verified.payload.lines).toEqual(result.lines);
    expect(getPortfolioHoldings).toHaveBeenCalledOnce();
  });
  it("returns a truthful zero discount below the first tier", async () => {
    vi.mocked(getPortfolioHoldings).mockResolvedValue(
      SUPPORTED_ASSETS.map((asset) => ({ asset, uiAmount: 0 })),
    );
    const result = await issueCoupon(signedRequest().body, "mios.test");
    expect(result.lines[0].discountPct).toBe(0);
  });
  it("rejects the original forged wallet/tier request and additional tier fields", async () => {
    const bad = await POST(
      request({
        wallet: "not-a-wallet",
        lines: [{ ticker: "AAPLx", tierId: 3 }],
      }),
    );
    expect(bad.status).toBe(400);
    const body = { ...signedRequest().body, tierId: 3 };
    expect((await POST(request(body))).status).toBe(400);
    expect(getPortfolioHoldings).not.toHaveBeenCalled();
  });
  it("rejects invalid proof before any RPC or pricing call", async () => {
    expect(
      (await POST(request({ challenge: "x", signature: "y" }))).status,
    ).toBe(401);
    expect(getPortfolioHoldings).not.toHaveBeenCalled();
    expect(getJupiterPrices).not.toHaveBeenCalled();
  });
  it("allows repeated demo issuance but rechecks eligibility each time", async () => {
    const s = signedRequest();
    await issueCoupon(s.body, "mios.test");
    vi.mocked(getPortfolioHoldings).mockResolvedValue(
      SUPPORTED_ASSETS.map((asset) => ({ asset, uiAmount: 0 })),
    );
    expect((await issueCoupon(s.body, "mios.test")).lines[0].discountPct).toBe(
      0,
    );
    expect(getPortfolioHoldings).toHaveBeenCalledTimes(2);
  });
  it("fails closed on RPC or price service failure", async () => {
    vi.mocked(getPortfolioHoldings).mockRejectedValueOnce(
      new Error("private RPC URL"),
    );
    let response = await POST(request(signedRequest().body));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private RPC");
    vi.mocked(getJupiterPrices).mockRejectedValueOnce(new Error("upstream"));
    response = await POST(request(signedRequest().body));
    expect(response.status).toBe(503);
  });
  it("rejects missing, invalid, unknown-age and expired prices", async () => {
    const fresh = (await getJupiterPrices()).AAPLx;
    for (const price of [
      null,
      { ...fresh, price: NaN },
      { ...fresh, price: 0 },
      { ...fresh, stale: true },
      { ...fresh, sourceUpdatedAtMs: null },
      { ...fresh, sourceUpdatedAtMs: Date.now() - 120001 },
    ]) {
      vi.mocked(getJupiterPrices).mockResolvedValue(
        price ? { AAPLx: price } : {},
      );
      expect((await POST(request(signedRequest().body))).status).toBe(503);
    }
  });
});
describe("HTTP validation", () => {
  it.each([null, [], {}, { lines: [null] }])(
    "returns a controlled 4xx for %j",
    async (body) => {
      const status = (await POST(request(body))).status;
      expect(status).toBeGreaterThanOrEqual(400);
      expect(status).toBeLessThan(500);
    },
  );
  it("rejects invalid JSON, oversized data, foreign origins and wrong content types", async () => {
    expect(
      (
        await POST(
          new Request("https://mios.test/api/coupon", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: "{",
          }),
        )
      ).status,
    ).toBe(400);
    expect((await POST(request({ payload: "a".repeat(9000) }))).status).toBe(
      413,
    );
    expect(
      (await POST(request({}, "/api/coupon", "https://evil.test"))).status,
    ).toBe(403);
    expect(
      (
        await POST(
          new Request("https://mios.test/api/coupon", {
            method: "POST",
            body: "{}",
          }),
        )
      ).status,
    ).toBe(415);
  });
  it("serves a challenge with no-store", async () => {
    const response = await challengePOST(
      request({ wallet: wallet().address, tickers: ["AAPLx"] }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json()).message).toContain("No transfiere fondos");
  });
});
describe("coupon verification", () => {
  const payload = (): CouponPayload => ({
    version: 2,
    demo: true,
    wallet: wallet().address,
    lines: [
      {
        ticker: "AAPLx",
        company: "Apple",
        discountPct: 5,
        tierLabel: "Tier 1",
      },
    ],
    timestamp: Math.floor(Date.now() / 1000),
  });
  it("accepts a valid demo coupon and rejects tampering, extra segments and expiry", () => {
    const p = payload(),
      token = createCouponToken(p);
    expect(verifyCouponToken(token).valid).toBe(true);
    expect(verifyCouponToken(token + ".extra").valid).toBe(false);
    const [b, sig] = token.split(".");
    const altered =
      Buffer.from(JSON.stringify({ ...p, wallet: wallet().address })).toString(
        "base64url",
      ) +
      "." +
      sig;
    expect(b).toBeTruthy();
    expect(verifyCouponToken(altered).valid).toBe(false);
    expect(verifyCouponToken(token, p.timestamp + 86400).valid).toBe(false);
    expect(verifyCouponToken(token, p.timestamp - 31).valid).toBe(false);
  });
  it("rejects legacy/invalid schemas and challenge tokens as coupons", () => {
    expect(verifyCouponToken(signedRequest().c.challenge).valid).toBe(false);
    for (const p of [
      null,
      { ...payload(), version: 1 },
      { ...payload(), lines: [null] },
      { ...payload(), demo: false },
    ]) {
      expect(verifyCouponToken(signToken("mios-coupon-v2", p)).valid).toBe(
        false,
      );
    }
  });
});
describe("tier boundaries", () => {
  it.each([
    [499.99, 0],
    [500, 5],
    [1999.99, 5],
    [2000, 10],
    [9999.99, 10],
    [10000, 15],
    [0, 0],
    [NaN, 0],
    [Infinity, 0],
    [-1, 0],
  ])("USD %s produces %s percent", (amount, pct) => {
    expect(resolveTier(amount).tier?.discountPct ?? 0).toBe(pct);
  });
});
