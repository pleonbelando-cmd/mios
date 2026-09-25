import { afterEach, expect, it, vi } from "vitest";
import { requestCoupon } from "../lib/request-coupon";
afterEach(() => vi.unstubAllGlobals());
it("never calls issuance when the user rejects signing", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      Response.json({ challenge: "proof", message: "readable" }),
    );
  vi.stubGlobal("fetch", fetcher);
  await expect(
    requestCoupon(
      "wallet",
      ["AAPLx"],
      vi.fn().mockRejectedValue(new Error("rejected")),
      new AbortController().signal,
      vi.fn(),
    ),
  ).rejects.toThrow("No se ha firmado");
  expect(fetcher).toHaveBeenCalledTimes(1);
});
it("does not submit a signature after changing wallet or leaving the page", async () => {
  const controller = new AbortController();
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      Response.json({ challenge: "proof", message: "readable" }),
    );
  vi.stubGlobal("fetch", fetcher);
  await expect(
    requestCoupon(
      "wallet",
      ["AAPLx"],
      async () => {
        controller.abort();
        return new Uint8Array(64);
      },
      controller.signal,
      vi.fn(),
    ),
  ).rejects.toThrow("wallet ha cambiado");
  expect(fetcher).toHaveBeenCalledTimes(1);
});
it("submits only proof and signature and returns the server lines", async () => {
  const result = {
    token: "signed",
    lines: [{ ticker: "AAPLx", discountPct: 5 }],
    demo: true,
  };
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({ challenge: "proof", message: "readable" }),
    )
    .mockResolvedValueOnce(Response.json(result));
  vi.stubGlobal("fetch", fetcher);
  const signer = vi.fn().mockResolvedValue(new Uint8Array(64));
  expect(
    await requestCoupon(
      "wallet",
      ["AAPLx"],
      signer,
      new AbortController().signal,
      vi.fn(),
    ),
  ).toEqual(result);
  expect(new TextDecoder().decode(signer.mock.calls[0][0])).toBe("readable");
  const sent = JSON.parse(fetcher.mock.calls[1][1].body);
  expect(Object.keys(sent).sort()).toEqual(["challenge", "signature"]);
});
