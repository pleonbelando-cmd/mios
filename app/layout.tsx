import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SolanaProviders } from "@/components/SolanaProviders";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
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
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink text-zinc-100">
        <SolanaProviders>
          <div className="flex flex-1 flex-col">{children}</div>
        </SolanaProviders>
        <footer className="mx-auto w-full max-w-2xl border-t border-ink-line px-5 py-6 text-center text-xs leading-relaxed text-zinc-400">
          Demo de hackathon. Las acciones tokenizadas (xStocks/Ondo) representan
          exposición económica a la empresa correspondiente, no derechos de
          accionista. MIOS no está afiliado, patrocinado ni respaldado por
          Apple, NVIDIA, Tesla, Alphabet ni S&amp;P Dow Jones Indices — los
          logotipos solo identifican el activo tokenizado. La tienda es un
          concepto de demo, no un comercio oficial de esas marcas. Los
          beneficios y cupones son de demostración, sin pago ni canje comercial.
          No es asesoramiento financiero.
        </footer>
      </body>
    </html>
  );
}
