import { expect, it, vi } from "vitest";
import { Connection, PublicKey } from "@solana/web3.js";
import { getPortfolioHoldings } from "../lib/holdings";
import { SUPPORTED_ASSETS } from "../lib/assets";
import { wallet } from "./helpers";
it("sums all accounts of a mint and uses scaled uiAmount, not raw amount", async () => {
  const account = (mint: string, uiAmount: number | null) => ({
    account: {
      data: {
        parsed: {
          info: {
            mint,
            tokenAmount: { uiAmount, amount: "999999999", decimals: 8 },
          },
        },
      },
    },
  });
  const rpc = {
    getParsedTokenAccountsByOwner: vi
      .fn()
      .mockResolvedValue({
        value: [
          account(SUPPORTED_ASSETS[0].mint.toBase58(), 1.25),
          account(SUPPORTED_ASSETS[0].mint.toBase58(), 2.5),
          account(SUPPORTED_ASSETS[1].mint.toBase58(), 4),
          account(wallet().address, 999),
        ],
      }),
  } as unknown as Connection;
  const holdings = await getPortfolioHoldings(
    rpc,
    new PublicKey(wallet().address),
  );
  expect(holdings.map((h) => h.uiAmount)).toEqual([3.75, 4, 0, 0, 0]);
  expect(rpc.getParsedTokenAccountsByOwner).toHaveBeenCalledOnce();
});
it("does not silently replace an unreadable balance with zero", async () => {
  const info = {
    mint: SUPPORTED_ASSETS[0].mint.toBase58(),
    tokenAmount: { uiAmount: null },
  };
  const rpc = {
    getParsedTokenAccountsByOwner: vi
      .fn()
      .mockResolvedValue({
        value: [{ account: { data: { parsed: { info } } } }],
      }),
  } as unknown as Connection;
  await expect(
    getPortfolioHoldings(rpc, new PublicKey(wallet().address)),
  ).rejects.toThrow();
});
