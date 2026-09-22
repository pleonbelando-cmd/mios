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
2. Lee tu **portfolio real de xStocks** (5 activos: AAPLx, NVDAx, TSLAx, SPYx, GOOGLx —
   Token-2022) directamente on-chain, en una sola llamada.
3. Valora cada posición en USD en tiempo real y calcula un **tier y % de descuento por empresa**
   (más acciones de una empresa = más descuento en su marca, no en las demás).
4. Muestra en vivo que AAPLx cotiza 24/7 mientras la acción real de Apple solo cotiza en horario
   NYSE (dato de Pyth Network).
5. **Marketplace** con una marca ficticia por activo (Orchard/Apple, Vertex Labs/Nvidia, Volt
   Motors/Tesla, Index & Co./S&P 500, Compass Digital/Alphabet): el carrito puede mezclar
   productos de varias marcas, cada línea con su propio descuento.
6. Al confirmar la compra emite un **cupón firmado (HMAC) con QR verificable**, con una línea de
   descuento por cada marca comprada — escanéalo y `/verify` comprueba la firma en el servidor.

## Por qué Solana

Los tokens de xStocks solo existen en Solana: son SPL (Token-2022) transferibles y componibles, y
se leen 24/7 desde cualquier app sin permiso del emisor. Eso es lo que hace posible este producto.

## Qué es real y qué es demo

| | |
|---|---|
| Balance de los 5 xStocks | **Real.** Lectura on-chain, Token-2022, incluye el ajuste `scaledUiAmount`. |
| Badge "AAPLx 24/7 / NYSE cerrado" | **Real.** `market_hours` de Pyth Network, sin clave. |
| Precio de cada activo en USD | **Real**, vía [Jupiter Price API](https://dev.jup.ag/docs/price-api) (gratis, batch de los 5 en una llamada). Pyth Hermes da el mismo dato para AAPLx pero solo con plan de pago (Starter, 500 $/mes) — el código ya está listo para activarlo si algún día hay `PYTH_API_KEY`. |
| Panel prima/descuento AAPLx vs AAPL real | **Real**, mismo endpoint de Jupiter. |
| Cupón con QR | **Real.** Firmado con HMAC-SHA256 server-side, verificable en `/verify`, caduca en 24h. |
| Marcas del marketplace (Orchard, Vertex Labs, Volt Motors, Index & Co., Compass Digital) | **Ficticias**, a propósito — evita usar marcas reales en la UI. |
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
  page.tsx             dashboard: wallet, portfolio (5 activos), tier por activo, prima/descuento
  store/page.tsx        marketplace: secciones por marca, carrito multi-activo, checkout, cupón
  verify/page.tsx        verificación del cupón (destino del QR)
  api/price/route.ts     precio de los 5 activos (Jupiter, o Pyth para AAPLx si hay clave) + market_hours
  api/coupon/route.ts    firma del cupón (re-valida tiers server-side)
lib/
  assets.ts     catálogo de xStocks soportados + marca ficticia por activo
  holdings.ts   balance de los 5 activos on-chain (Token-2022), una sola llamada RPC
  pyth.ts       cliente Hermes + market_hours (AAPLx)
  jupiter.ts    precio gratuito de los 5 activos, en batch
  tiers.ts      motor de tiers/descuentos (mismo config, por activo)
  products.ts   catálogo del marketplace, un producto ligado a un ticker
  coupon.ts     firma y verificación HMAC, multi-línea (una por marca comprada)
```

Contexto completo del proyecto (decisiones, hallazgos verificados, plan) en [`CLAUDE.md`](./CLAUDE.md).
