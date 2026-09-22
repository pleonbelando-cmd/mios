@AGENTS.md

# MIOS — Beneficios programables para holders de acciones tokenizadas

> Proyecto para el hackathon **Stocklana** (Solana Foundation).
> Nombre del proyecto: **MIOS** (repo, URL de Vercel y marca del pitch).
> Este fichero es el contexto maestro. Léelo entero antes de escribir código.
> Ver también **§13** al final: hallazgos ya verificados el 22/09/2026, no re-investigar.

---

## 0. Regla de oro para el hackathon

El único criterio de los jueces es: **"¿Podría ser una app real que la gente use?"**
Buscan: usuario y problema reales, **demo funcional de principio a fin**, una razón por la que
tenga sentido en Solana, y calidad de ejecución. *Código real que funcione en mainnet > slides.*
Prioriza SIEMPRE: (1) que la demo funcione end-to-end, (2) que se entienda el pitch, (3) pulido visual.

---

## 1. Datos del hackathon (no negociables)

- **Deadline de entrega: viernes 25 sept 2026, 22:00 hora de Madrid** (16:00 ET). Se puede editar hasta el cierre.
- Entrega: registrarse en https://hackathons.solana.com/hackathons/stocklana → "Submit Project"
  con al menos un enlace (**GitHub + demo en vivo + vídeo**, ponemos los tres).
- Premio: track principal 100.000 $ (Solana Foundation). Nosotros apuntamos a:
  - **Track principal – categoría Consumer** (mobile-first investing, social, spending from a portfolio).
  - **Bounty Pyth Network** (usar datos de mercado de Pyth como pieza central) → premio: 3 meses de Pyth Pro.
- Elegibilidad: individuos o equipos, una entrega por equipo, trabajo original. Componentes open-source: ok si se declara.
- Equipo: 1–2 personas. Pepe valida producto/lógica financiera; Claude Code escribe el grueso.

---

## 2. El producto

**Qué es:** una app que verifica **on-chain** que una wallet posee acciones tokenizadas de una empresa
y, según el valor de esa posición, **desbloquea beneficios programables** (descuentos, cupones, acceso)
al consumir productos/servicios de esa marca.

**El problema real:** hoy tener acciones y ser cliente de una empresa son dos mundos separados.
Un holder de Apple no obtiene nada como cliente de Apple. Con acciones tokenizadas en Solana, cualquier
comercio puede leer la posición del cliente en su wallet y recompensarla de forma automática y verificable.

**Usuario:** (a) el inversor-cliente que quiere que su cartera le dé ventajas al consumir;
(b) la marca que quiere fidelizar a sus inversores minoristas sin fricción ni intermediarios.

**Por qué en Solana (esto lo puntúan):** los tokens de xStocks/Ondo solo existen en Solana, son SPL
transferibles y componibles, y se leen 24/7 desde cualquier app sin permiso del emisor. Un certificado
de acción en papel no permite nada de esto.

### Matiz legal → convertirlo en el argumento central
Las acciones tokenizadas (xStocks, Ondo) dan **exposición económica, NO derechos de accionista**
(el holder no es accionista registrado). Por eso NO vendemos esto como "derechos de accionista".
Lo enmarcamos como **lealtad/beneficios programables que la acción en papel nunca podría dar**:
automáticos, componibles, verificables por cualquier marca, 24/7. Es honesto y es el "por qué Solana".
Mostrar un disclaimer claro en la app (ver §11).

---

## 3. Alcance del MVP (lo que construimos en 3 días)

**REAL (tiene que funcionar de verdad):**
1. Conectar wallet (Phantom, vía Wallet Standard) con Solana wallet-adapter.
2. Leer el balance del token tokenizado de demo (**AAPLx**, ver §6) en la wallet conectada. **Token-2022.**
3. Valorar la posición en USD en tiempo real con **Pyth** (feed de AAPLx). → determina el "tier".
4. Motor de tiers y cálculo del descuento aplicable.
5. Tienda de demo con checkout que aplica el descuento y emite un **cupón/QR verificable**.
6. **Modo "ver wallet"**: además de conectar Phantom, se puede pegar cualquier dirección pública y
   leer su saldo real on-chain. Mismo código de lectura, sin simulación — es el fallback si falla la
   wallet del portátil el día de la demo/grabación.

**SIMULADO (y está bien que lo esté — se explica en el pitch):**
- La tienda/marca es **ficticia** (p. ej. "Orchard Store", estética genérica). NO uses marcas reales
  (Coca-Cola, Apple…) en la UI de la tienda para evitar problemas de marca en la entrega. La acción
  tokenizada verificada sí es real (AAPLx); la narrativa de "marca que premia a sus holders" es el concepto.
- No hay pasarela de pago real: el checkout es una maqueta que demuestra el flujo.

**NO-GOALS (no tocar, hunden el plazo):**
- Nada de smart contracts propios ni despliegue de programas Solana.
- Nada de lanzar tokens (eso es de otros bounties: Meteora/Clawpump — fuera de alcance).
- Nada de KYC, custodia, ni integración con comercios reales.

**Objetivo de Fase 3 (subido desde "stretch" — ver §13.4):**
- Panel de **prima/descuento**: comparar AAPLx vs AAPL real usando el feed dedicado de *redemption
  rate* de Pyth (`Crypto.AAPLX/AAPL.RR`). Refuerza mucho el bounty de Pyth y cuesta poco con ese feed.

**Stretch real (solo si sobra tiempo el jueves):**
- Cupón como NFT/atestación on-chain en vez de firmado off-chain (HMAC).
- Botón "comprar más AAPLx" que enlaza a un swap en Jupiter.

---

## 4. Stack técnico

- **Next.js 16 (App Router) + TypeScript + Tailwind v4.** Deploy en **Vercel**.
- **@solana/web3.js** + **@solana/spl-token** (Token-2022) para leer balances.
- **@solana/wallet-adapter-react** + **@solana/wallet-adapter-react-ui**. **Sin**
  `@solana/wallet-adapter-wallets`: arrastra WalletConnect/Stellar y su postinstall rompe sin `yarn`
  instalado; Wallet Standard ya autodetecta Phantom sin él (ver §13.1).
- **@pythnetwork/hermes-client** para precios (ver §7 y §13.3).
- RPC de Solana: **Helius** (free tier); el RPC público de mainnet va limitado, solo como fallback.
- UI: móvil primero (el track es Consumer). Cuidar el pulido: es un criterio de puntuación.

Variables de entorno (`.env.local`):
```
NEXT_PUBLIC_SOLANA_RPC_URL=   # p.ej. https://mainnet.helius-rpc.com/?api-key=...
PYTH_API_KEY=                 # ver §7 y §13.3 (Pyth Pro / bounty)
```

---

## 5. Arquitectura / módulos

1. **SolanaProviders** (`components/SolanaProviders.tsx`) — ConnectionProvider + WalletProvider +
   WalletModalProvider, sin lista explícita de wallets (Wallet Standard).
2. **lib/holdings.ts** — dado un `owner` (pubkey) y el mint de AAPLx, devuelve el balance.
   - AAPLx es **Token-2022**: usa `connection.getParsedTokenAccountsByOwner(owner, { programId:
     TOKEN_2022_PROGRAM_ID })` y filtra por el mint. NO asumas el SPL clásico. Usa siempre
     `tokenAmount.uiAmount` (ya viene escalado por scaledUiAmount, ver §13.1) — nunca calcules a mano
     dividiendo `amount` por `10^decimals`.
3. **lib/pyth.ts** — obtiene el precio de AAPLx (y opcionalmente de la acción real) vía Hermes (§7, §13.3).
4. **lib/tiers.ts** — valor USD = balance × precio Pyth. Mapea a tier y % de descuento. Config editable:
   ```
   Tier 1: ≥ 500 USD  → 5%
   Tier 2: ≥ 2.000 USD → 10%
   Tier 3: ≥ 10.000 USD → 15%
   ```
5. **app/page.tsx** — dashboard: wallet, posición, valor USD, tier actual y descuento desbloqueado.
6. **app/store** — tienda ficticia con productos; el checkout aplica el descuento del tier.
7. **components/Coupon.tsx** — genera un cupón con QR que codifica {wallet, tier, descuento, timestamp, firma}.
   Firma HMAC server-side (`app/api/coupon/route.ts`) + página `app/verify` que la comprueba.

---

## 6. Referencias on-chain (verificadas — ver §13.1, no volver a comprobar)

**Acción de demo: Apple.**

- **AAPLx (xStock, Backed) — mint:** `XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp`
  **Confirmado on-chain** (metadata `name: "Apple xStock"`, dominio de Backed). **Token-2022**
  (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`), **8 decimales**. Extensión `scaledUiAmount`
  activa (multiplicador ≈1,0027) — detalle crítico, ver §13.1.
- Sin allowlist ni KYC on-chain: cualquier wallet retail puede mantenerlo.
- Contingencia si hiciera falta otro token: **SPYx** `XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W`
  (más líquido) o **NVDAx** `Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh`.
- Ondo Global Markets (AAPLon) — opcional, solo si se hace el panel de prima/descuento con esa variante.

---

## 7. Integración de Pyth (pieza central del bounty) — ver §13.3 para lo verificado hoy

- Pyth actualizó su Core el 26/08/2026: **Hermes ahora requiere API key.** Endpoint que SÍ funciona
  hoy: `https://pyth.dourolabs.app/hermes` (el legacy `hermes.pyth.network` da 401 sin clave).
- Alta de la clave: `https://pythdata.app/signup` → botón "View your API key". Self-service, free
  trial incluido.
- Cliente: `@pythnetwork/hermes-client` v3.1.0 (`HermesClient`, opción `accessToken`).
- **Resolver los feed IDs de la tabla en §13.3** (ya verificados contra la API oficial, no inventarlos).
- Precio = `price × 10^expo`. Maneja el intervalo de confianza (`conf`) y el caso "sin precio". No hay
  campo `status`: rechaza por antigüedad de `publish_time`. `/v2/price_feeds` da `market_hours` sin
  clave — úsalo para el badge de mercado abierto/cerrado (momento fuerte del pitch, ver §13.4).

Config MCP para Claude Code (`.mcp.json`), para que Claude resuelva IDs y precios mientras construye:
```json
{
  "mcpServers": {
    "pyth": { "url": "https://mcp.pyth.network/mcp" }
  }
}
```

---

## 8. Plan de 3 días

**Martes (hoy) — cimientos**
- `create-next-app` + Tailwind + wallet-adapter + conectar Phantom.
- `lib/holdings.ts`: leer balance de AAPLx (Token-2022) de la wallet conectada. Verificar mint en explorer.
- Deploy inicial a Vercel (aunque esté vacío) para tener el enlace desde ya.

**Miércoles — el núcleo**
- `lib/pyth.ts`: precio de AAPLx vía Hermes. Valor USD de la posición.
- `lib/tiers.ts` + dashboard mostrando tier y descuento.
- Tienda ficticia con productos y checkout que aplica el descuento.

**Jueves — cierre**
- `Coupon.tsx` con QR verificable. Pulido visual móvil. Copys claros. Disclaimer legal.
- Panel prima/descuento con Pyth (§13.4).
- Grabar vídeo (§10), escribir descripción, **enviar el proyecto** con margen (no dejarlo para las 21:59).

---

## 9. Checklist de entrega

- [ ] Repo público en GitHub con README claro.
- [ ] Demo en vivo desplegada (Vercel) y probada en móvil.
- [ ] Vídeo de 60–90 s (§10).
- [ ] Descripción del proyecto: problema, solución, por qué Solana, cómo usa Pyth, qué es real vs demo.
- [ ] Marcar que usa **Pyth** (para el bounty).
- [ ] Enviado en https://hackathons.solana.com/hackathons/stocklana antes del **viernes 22:00 Madrid**.

---

## 10. Guion del vídeo (60–90 s)

1. (0–15s) El problema: "Tienes acciones y eres cliente de la marca, pero ser accionista no te da nada como cliente."
2. (15–40s) Demo en vivo: conectar Phantom → la app lee tu AAPLx → Pyth valora la posición → se desbloquea el tier y el descuento.
3. (40–65s) Ir a la tienda → comprar con el descuento aplicado → generar el cupón/QR verificable.
4. (65–90s) Por qué en Solana (tokens componibles, 24/7, sin permiso del emisor) + visión: cualquier marca puede premiar a sus holders. Disclaimer honesto (exposición económica, no derechos de accionista).

---

## 11. Disclaimer a mostrar en la app (pie de página)

> Demo de hackathon. Las acciones tokenizadas (xStocks/Ondo) representan exposición económica, no
> derechos de accionista. La tienda y la marca son ficticias. No es asesoramiento financiero.

Ya está en `app/layout.tsx` (footer global).

---

## 12. Quickstart — YA EJECUTADO el 22/09/2026

El proyecto ya está creado en esta carpeta. Si necesitas recrearlo desde cero en otra máquina:

```bash
npx create-next-app@latest mios --typescript --tailwind --app --eslint --import-alias "@/*" --use-npm --disable-git
cd mios
npm i @solana/web3.js @solana/spl-token @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @pythnetwork/hermes-client react-qr-code
# NO instales @solana/wallet-adapter-wallets — ver §4 y §13.1 (rompe el install sin yarn)
# coloca este CLAUDE.md en la raíz del repo y crea .env.local (ver §4)
claude
```

---

## 13. Estado y hallazgos verificados (22/09/2026) — no re-investigar

### 13.1 AAPLx on-chain (RPC mainnet, slot 449.340.359)
- Mint `XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp` confirmado (metadata de Backed).
- **Token-2022**, **8 decimales**.
- ⚠️ **Extensión `scaledUiAmountConfig`, multiplicador ≈1,0026642** (ajuste por dividendos). El
  balance crudo ≠ balance real. `lib/holdings.ts` ya usa `tokenAmount.uiAmount` — no lo cambies por
  un cálculo manual de `amount / 10^decimals`.
- `transferHook.programId = null` (no bloquea), `defaultAccountState: initialized` (cualquier wallet
  puede recibir), `permanentDelegate` y `freezeAuthority` en manos de Backed (no afecta a leer balance).
- Sin allowlist ni KYC on-chain. Liquidez sana: ~$11,2M volumen 24h, 35.377 holders.
- Instalar `@solana/wallet-adapter-wallets` **rompe el `npm install`**: arrastra
  `@stellar/stellar-sdk`, cuyo postinstall ejecuta `yarn setup` y no hay `yarn` en esta máquina.
  Se resolvió **sin ese paquete** — Wallet Standard detecta Phantom solo. Si algún día hace falta
  un adaptador legacy explícito, instalar `yarn` primero o usar `--ignore-scripts`.

### 13.2 Entorno local (Windows, esta máquina)
- Node v24.18.0, npm 11.16.0. Git y GitHub CLI se instalaron con
  `winget install --scope user` (el scope `machine` por defecto pedía UAC y esta shell no puede
  confirmarlo). `git config --global user.name "aikkia"`,
  `user.email "p.leonbelando@gmail.com"` ya configurados.
- `gh auth login` es interactivo — lo lanza el usuario, no Claude Code.

### 13.3 Pyth — endpoint y feed IDs verificados
- Hermes legacy (`hermes.pyth.network/v2/updates/price/latest`) → **401 sin clave** (confirmado en
  vivo). Endpoint que funciona: **`https://pyth.dourolabs.app/hermes`**, auth `Authorization: Bearer`
  o `accessToken` del cliente JS.
- Alta de clave: `https://pythdata.app/signup` → "View your API key". Self-service, free trial.
- `@pythnetwork/hermes-client` v3.1.0. El README de GitHub del paquete está desactualizado (endpoint
  viejo sin token) — seguir la doc oficial, no el README. Forzar `export const runtime = "nodejs"`
  en el Route Handler (el paquete depende de `eventsource` + Node 24, no vale Edge).
- Feed IDs (verificados contra `/v2/price_feeds`, no reinventar):

  | Símbolo | Feed ID |
  |---|---|
  | `Crypto.AAPLX/USD` | `0x978e6cc68a119ce066aa830017318563a9ed04ec3a0a6439010fc11296a58675` |
  | `Equity.US.AAPL/USD` | `0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688` |
  | `Equity.Index.AAPL/USD` (24/7) | `0xaaba35e6f33fb973bb2201d48a79ae24795affa6ba8bd50a93dcaf7da0030f36` |
  | `Crypto.AAPLX/AAPL.RR` (redemption rate) | `0x25babb83691a056fd65f879bfd7197eabd840aae741f69c87ccb31e204a979b2` |

- `/v2/price_feeds?query=...` responde **sin clave** y devuelve `market_hours: { is_open, next_open,
  next_close }` — úsalo para el badge de mercado abierto/cerrado.

### 13.4 Decisiones de producto que salen de la investigación
1. El badge "mercado cerrado / AAPLx cotizando 24/7" (con `market_hours`) es el momento fuerte de la
   demo, no una nota al pie — es exactamente lo que premia el bounty de Pyth.
2. El panel de prima/descuento AAPLx vs AAPL real sube de "stretch" a objetivo de la Fase 3 porque
   existe el feed `Crypto.AAPLX/AAPL.RR` ya calculado — son ~30 líneas, no una tarde.

### 13.5 Next.js 16 — nota de arquitectura
- **Cache Components está desactivado** (`next.config.ts` sin `cacheComponents: true`) → modelo de
  caching clásico, sin necesidad de `'use cache'`/`<Suspense>` obligatorio. Los Route Handlers no se
  cachean por defecto, que es lo que queremos para precios en vivo.
- Antes de tocar convenciones de routing/caching que no estén ya resueltas arriba, lee
  `node_modules/next/dist/docs/` — esta versión tiene cambios respecto a versiones anteriores de
  Next.js (ver `AGENTS.md`, importado al principio de este fichero).
