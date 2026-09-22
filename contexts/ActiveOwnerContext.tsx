"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

type ActiveOwnerContextValue = {
  /** wallet conectada, o la dirección "peekeada" si hay una activa */
  activeOwner: PublicKey | null;
  connectedOwner: PublicKey | null;
  peeked: PublicKey | null;
  setPeeked: (owner: PublicKey | null) => void;
};

const ActiveOwnerContext = createContext<ActiveOwnerContextValue | null>(null);

export function ActiveOwnerProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const [peeked, setPeeked] = useState<PublicKey | null>(null);

  const value = useMemo<ActiveOwnerContextValue>(
    () => ({
      activeOwner: peeked ?? publicKey,
      connectedOwner: publicKey,
      peeked,
      setPeeked,
    }),
    [peeked, publicKey]
  );

  return (
    <ActiveOwnerContext.Provider value={value}>
      {children}
    </ActiveOwnerContext.Provider>
  );
}

export function useActiveOwner() {
  const ctx = useContext(ActiveOwnerContext);
  if (!ctx) {
    throw new Error("useActiveOwner debe usarse dentro de ActiveOwnerProvider");
  }
  return ctx;
}
