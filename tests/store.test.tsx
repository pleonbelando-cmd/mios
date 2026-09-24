// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import StorePage from "../app/store/page";
import { usePortfolio } from "../hooks/usePortfolio";
import { useActiveOwner } from "../contexts/ActiveOwnerContext";
import { requestCoupon } from "../lib/request-coupon";
import { PublicKey } from "@solana/web3.js";
import { SUPPORTED_ASSETS } from "../lib/assets";
import { resolveTier } from "../lib/tiers";
vi.mock("../hooks/usePortfolio", () => ({ usePortfolio: vi.fn() }));
vi.mock("../contexts/ActiveOwnerContext", () => ({ useActiveOwner: vi.fn() }));
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({ signMessage: vi.fn() }),
}));
vi.mock("../lib/request-coupon", () => ({ requestCoupon: vi.fn() }));
vi.mock("../components/Coupon", () => ({
  Coupon: () => <p>QR de demostración</p>,
}));
const owner = new PublicKey(SUPPORTED_ASSETS[0].mint);
beforeEach(() => {
  vi.mocked(useActiveOwner).mockReturnValue({
    activeOwner: owner,
    connectedOwner: owner,
    peeked: null,
    setPeeked: vi.fn(),
  });
  vi.mocked(usePortfolio).mockReturnValue({
    owner,
    holdingsStatus: "idle",
    priceStatus: "idle",
    marketHours: null,
    positions: SUPPORTED_ASSETS.map((asset) => ({
      asset,
      uiAmount: 100,
      price: null,
      usdValue: 10000,
      tierResult: resolveTier(10000),
    })),
  });
});
afterEach(cleanup);
function addItem() {
  fireEvent.click(
    screen.getByRole("button", { name: "Añadir Auriculares inalámbricos" }),
  );
}
const submit = () =>
  screen.getByRole("button", {
    name: "Firmar mensaje y generar cupón demo",
  }) as HTMLButtonElement;
it("blocks issuance in public-address mode even if that address matches the connected wallet", () => {
  vi.mocked(useActiveOwner).mockReturnValue({
    activeOwner: owner,
    connectedOwner: owner,
    peeked: owner,
    setPeeked: vi.fn(),
  });
  render(<StorePage />);
  addItem();
  expect(submit().disabled).toBe(true);
  expect(requestCoupon).not.toHaveBeenCalled();
});
it("blocks issuance while balances are loading", () => {
  const snapshot = vi.mocked(usePortfolio)();
  vi.mocked(usePortfolio).mockReturnValue({
    ...snapshot,
    holdingsStatus: "loading",
  });
  render(<StorePage />);
  addItem();
  expect(submit().disabled).toBe(true);
});
it("uses returned server discounts rather than the preview discount for the final total", async () => {
  vi.mocked(requestCoupon).mockResolvedValue({
    token: "demo",
    wallet: owner.toBase58(),
    lines: [
      {
        ticker: "AAPLx",
        company: "Apple",
        tierLabel: "Tier 1",
        discountPct: 5,
      },
    ],
    issuedAt: 0,
    expiresAt: 86400,
    demo: true,
  });
  render(<StorePage />);
  addItem();
  fireEvent.click(submit());
  await waitFor(() =>
    expect(screen.getByText("Posición acreditada")).toBeTruthy(),
  );
  expect(screen.getByText(/84,55/)).toBeTruthy();
  expect(screen.getByText(/No se ha cobrado ningún importe/)).toBeTruthy();
});
