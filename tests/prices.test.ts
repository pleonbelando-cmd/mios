import { afterEach, expect, it, vi } from "vitest";
import { getJupiterPrices } from "../lib/jupiter";
import { getServerConnection } from "../lib/server-connection";
import { SUPPORTED_ASSETS } from "../lib/assets";
import { isUsablePrice } from "../lib/prices";
vi.mock("../lib/server-connection", () => ({ getServerConnection: vi.fn() }));
afterEach(() => vi.unstubAllGlobals());
it("derives token age from block time independently of an old equity closing price", async () => {
  const getBlockTime = vi.fn().mockResolvedValue(Math.floor(Date.now() / 1000));
  vi.mocked(getServerConnection).mockReturnValue({
    getBlockTime,
  } as unknown as ReturnType<typeof getServerConnection>);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({
          [SUPPORTED_ASSETS[0].mint.toBase58()]: {
            usdPrice: 100,
            blockId: 123,
            stockData: { price: 99, updatedAt: "2020-01-01T00:00:00Z" },
          },
        }),
      ),
  );
  const prices = await getJupiterPrices();
  expect(isUsablePrice(prices.AAPLx)).toBe(true);
  expect(prices.AAPLx.stockRefUpdatedAtMs).toBe(
    Date.parse("2020-01-01T00:00:00Z"),
  );
  expect(prices.AAPLx.sourceUpdatedAtMs).toBeGreaterThan(
    prices.AAPLx.stockRefUpdatedAtMs!,
  );
  expect(getBlockTime).toHaveBeenCalledWith(123);
});
it.each([null, Math.floor(Date.now() / 1000) - 301])(
  "fails closed on unknown or old block time %s",
  async (blockTime) => {
    vi.mocked(getServerConnection).mockReturnValue({
      getBlockTime: vi.fn().mockResolvedValue(blockTime),
    } as unknown as ReturnType<typeof getServerConnection>);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({
            [SUPPORTED_ASSETS[0].mint.toBase58()]: {
              usdPrice: 100,
              blockId: 123,
            },
          }),
        ),
    );
    expect((await getJupiterPrices()).AAPLx.stale).toBe(true);
  },
);
