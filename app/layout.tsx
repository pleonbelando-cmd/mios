import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SolanaProviders } from "@/components/SolanaProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIOS — Beneficios programables para holders de acciones tokenizadas",
  description:
    "Conecta tu wallet, verifica tu posición en acciones tokenizadas on-chain y desbloquea beneficios programables. Proyecto para el hackathon Stocklana (Solana Foundation).",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-950 text-zinc-100">
        <SolanaProviders>
          <div className="flex flex-1 flex-col">{children}</div>
        </SolanaProviders>
        <footer className="border-t border-zinc-900 px-4 py-4 text-center text-[11px] leading-relaxed text-zinc-600">
          Demo de hackathon. Las acciones tokenizadas (xStocks/Ondo)
          representan exposición económica, no derechos de accionista. La
          tienda y la marca son ficticias. No es asesoramiento financiero.
        </footer>
      </body>
    </html>
  );
}
