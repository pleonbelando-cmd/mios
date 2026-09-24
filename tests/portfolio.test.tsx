// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PublicKey } from "@solana/web3.js";
import { usePortfolio } from "../hooks/usePortfolio";
import { getPortfolioHoldings } from "../lib/holdings";
import { SUPPORTED_ASSETS } from "../lib/assets";
const state = vi.hoisted(() => ({
  owner: null as PublicKey | null,
  connection: {},
}));
vi.mock("@solana/wallet-adapter-react", () => ({
  useConnection: () => ({ connection: state.connection }),
}));
vi.mock("../contexts/ActiveOwnerContext", () => ({
  useActiveOwner: () => ({ activeOwner: state.owner }),
}));
vi.mock("../lib/holdings", () => ({ getPortfolioHoldings: vi.fn() }));
const ownerA = SUPPORTED_ASSETS[0].mint,
  ownerB = SUPPORTED_ASSETS[1].mint;
const balances = (n: number) =>
  SUPPORTED_ASSETS.map((asset) => ({ asset, uiAmount: n }));
beforeEach(() => {
  state.owner = ownerA;
  vi.mocked(getPortfolioHoldings).mockReset().mockResolvedValue(balances(20));
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        prices: Object.fromEntries(
          SUPPORTED_ASSETS.map((a) => [
            a.ticker,
            {
              source: "jupiter",
              price: 100,
              fetchedAtMs: Date.now(),
              sourceUpdatedAtMs: Date.now(),
              stale: false,
            },
          ]),
        ),
      }),
    ),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it("invalidates old positions immediately on owner change and clears them on failure/disconnect", async () => {
  const { result, rerender } = renderHook(() => usePortfolio());
  await waitFor(() =>
    expect(result.current.positions[0].tierResult?.tier?.discountPct).toBe(10),
  );
  vi.mocked(getPortfolioHoldings).mockRejectedValueOnce(new Error("RPC"));
  state.owner = ownerB;
  rerender();
  expect(result.current.positions[0].tierResult).toBeNull();
  await waitFor(() => expect(result.current.holdingsStatus).toBe("error"));
  expect(result.current.positions[0].uiAmount).toBe(0);
  state.owner = null;
  rerender();
  expect(result.current.owner).toBeNull();
  expect(result.current.positions[0].uiAmount).toBe(0);
});
it("ignores a late response from a previously selected owner", async () => {
  let resolveOld!: (value: ReturnType<typeof balances>) => void;
  vi.mocked(getPortfolioHoldings)
    .mockReturnValueOnce(
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
    )
    .mockResolvedValueOnce(balances(1));
  const { result, rerender } = renderHook(() => usePortfolio());
  await waitFor(() => expect(getPortfolioHoldings).toHaveBeenCalledTimes(1));
  state.owner = ownerB;
  rerender();
  await waitFor(() => expect(result.current.positions[0].uiAmount).toBe(1));
  await act(async () => resolveOld(balances(1000)));
  expect(result.current.positions[0].uiAmount).toBe(1);
});
it("refreshes on focus and after twenty seconds without overlapping requests", async () => {
  const { result } = renderHook(() => usePortfolio());
  await waitFor(() => expect(result.current.holdingsStatus).toBe("idle"));
  vi.mocked(getPortfolioHoldings).mockResolvedValue(balances(1));
  act(() => window.dispatchEvent(new Event("focus")));
  await waitFor(() => expect(result.current.positions[0].uiAmount).toBe(1));
  expect(getPortfolioHoldings).toHaveBeenCalledTimes(2);
  cleanup();
  vi.useFakeTimers();
  renderHook(() => usePortfolio());
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
  const count = vi.mocked(getPortfolioHoldings).mock.calls.length;
  await act(async () => {
    await vi.advanceTimersByTimeAsync(20_000);
  });
  expect(getPortfolioHoldings).toHaveBeenCalledTimes(count + 1);
});
it("clears valuations after an HTTP price failure", async () => {
  const { result } = renderHook(() => usePortfolio());
  await waitFor(() => expect(result.current.positions[0].usdValue).toBe(2000));
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ error: "unavailable" }, { status: 503 })),
  );
  act(() => window.dispatchEvent(new Event("focus")));
  await waitFor(() => expect(result.current.priceStatus).toBe("error"));
  expect(result.current.positions[0].usdValue).toBeNull();
  expect(result.current.positions[0].tierResult).toBeNull();
});
