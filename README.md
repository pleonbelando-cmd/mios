# MIOS

**Beneficios programables para holders de acciones tokenizadas.** Proyecto para el hackathon
[Stocklana](https://hackathons.solana.com/hackathons/stocklana) (Solana Foundation).

**Demo en vivo:** https://mios-omega.vercel.app

## El problema

Hoy tener acciones y ser cliente de una empresa son dos mundos separados: un holder de Apple no
obtiene nada como cliente de Apple. Con acciones tokenizadas en Solana ([xStocks](https://xstocks.com/)),
cualquier comercio puede leer la posición del cliente en su wallet y recompensarla de forma
automática y verificable — algo que un certificado de acción en papel nunca podría dar.

## Qué hace

1. Conecta tu wallet (Phantom, vía Wallet Standard) — o pega cualquier dirección pública en el
   modo "ver wallet".
2. Lee tu balance real de **AAPLx** (Apple xStock, Token-2022) directamente on-chain.
3. Valora la posición en USD en tiempo real y calcula tu **tier** y % de descuento.
4. Muestra en vivo que AAPLx cotiza 24/7 mientras la acción real de Apple solo cotiza en horario
   NYSE (dato de Pyth Network).
5. En la tienda ficticia **Orchard Store**, aplica tu descuento y emite un **cupón firmado (HMAC)
   con QR verificable** — escanéalo y `/verify` comprueba la firma en el servidor.

## Por qué Solana

Los tokens de xStocks solo existen en Solana: son SPL (Token-2022) transferibles y componibles, y
se leen 24/7 desde cualquier app sin permiso del emisor. Eso es lo que hace posible este producto.

## Qué es real y qué es demo

| | |
|---|---|
| Balance de AAPLx | **Real.** Lectura on-chain, Token-2022, incluye el ajuste `scaledUiAmount`. |
| Badge "AAPLx 24/7 / NYSE cerrado" | **Real.** `market_hours` de Pyth Network, sin clave. |
| Precio de AAPLx en USD | **Real**, vía [Jupiter Price API](https://dev.jup.ag/docs/price-api) (gratis). Pyth Hermes da el mismo dato pero solo con plan de pago (Starter, 500 $/mes) — el código ya está listo para activarlo si algún día hay `PYTH_API_KEY`. |
| Panel prima/descuento vs AAPL real | **Real**, mismo endpoint de Jupiter. |
| Cupón con QR | **Real.** Firmado con HMAC-SHA256 server-side, verificable en `/verify`, caduca en 24h. |
| Marca y tienda ("Orchard Store") | **Ficticias**, a propósito — evita usar marcas reales en la UI. |
| Checkout | **Maqueta.** No hay pasarela de pago real. |

> Las acciones tokenizadas (xStocks/Ondo) representan exposición económica, no derechos de
> accionista. No es asesoramiento financiero.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · `@solana/web3.js` + `@solana/spl-token`
(Token-2022) · `@solana/wallet-adapter-react` (Wallet Standard, sin adaptadores explícitos) ·
Jupiter Price API v3 · Pyth Network (`market_hours`, y Hermes si hay clave) · Vercel.

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # rellena NEXT_PUBLIC_SOLANA_RPC_URL (Helius, gratis) y COUPON_SECRET
npm run dev
```

`PYTH_API_KEY` es opcional — sin ella, el precio se obtiene igualmente vía Jupiter.

## Estructura

```
app/
  page.tsx          dashboard: wallet, posición, tier, prima/descuento
  store/page.tsx     Orchard Store: carrito + checkout + cupón
  verify/page.tsx     verificación del cupón (destino del QR)
  api/price/route.ts  precio (Jupiter, o Pyth si hay clave) + market_hours
  api/coupon/route.ts firma del cupón
lib/
  holdings.ts   balance de AAPLx on-chain (Token-2022)
  pyth.ts       cliente Hermes + market_hours
  jupiter.ts    precio gratuito de AAPLx
  tiers.ts      motor de tiers/descuentos
  coupon.ts     firma y verificación HMAC
```

Contexto completo del proyecto (decisiones, hallazgos verificados, plan) en [`CLAUDE.md`](./CLAUDE.md).
