# MIOS

**Turn a verified tokenized-stock position into demonstrable shopping benefits.**

Built for [Stocklana](https://hackathons.solana.com/hackathons/stocklana).
Existing production demo: https://mios-omega.vercel.app
The Stocklana improvements are delivered through a PR and preview; this link does not imply they have been merged.

## The experience

1. Connect a Solana wallet, or inspect a public address in read-only mode.
2. Read real Token-2022 holdings for AAPLx, NVDAx, TSLAx, SPYx and GOOGLx.
3. See each position's value, illustrative benefit and progress toward the next level.
4. Choose generic products in a clearly labelled demonstration marketplace.
5. Sign a readable message proving control of your wallet. This is **not a transaction**.
6. The server verifies the signature, rereads holdings and Jupiter prices, and signs a demonstration coupon.
7. Open or scan the QR to verify the signed record and its 24-hour expiry.

Thresholds apply **per asset**: $500 → 5%, $2,000 → 10%, $10,000 → 15%.
Balances below $500 receive 0%, including when a coupon covers several assets.
The independent `/example` page uses explicitly fictional values. It never issues a signed coupon.

## What is real and what is illustrative

| Real                                                         | Illustrative / not implemented                           |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| Wallet control via Ed25519 message signature                 | Merchant campaigns, products and shopping totals         |
| Mainnet Token-2022 holdings, summing all accounts for a mint | Commercial agreements with the displayed companies       |
| Jupiter token prices and on-chain block-time recency checks  | Payment, trading and commercial redemption               |
| Pyth market-hours metadata                                   | Minimum holding period and single-use redemption         |
| Server-calculated benefit and HMAC-signed evidence           | Any investment recommendation or shareholder entitlement |

A coupon proves the checked position **at issuance**, not the current balance when scanned.
It is a demonstration, not redeemable, and not single-use. The five-minute proof can be reused during its validity; every issuance rereads eligibility. There is no order database or redemption ledger.

xStocks provide exposure to underlying equities; they do not by themselves confer shareholder rights.
MIOS is not affiliated with or endorsed by Apple, NVIDIA, Tesla, Alphabet or S&P Dow Jones Indices.
The names/logos identify the underlying assets; products are generic examples.

## Why Solana

Solana's publicly readable token accounts and wallet standards make it possible to check an eligible position without taking custody. These xStocks use Token-2022, including scaled UI balances. xStocks also exist on other chains; exclusivity to Solana is not our argument.

## Prices and market data

- Coupon eligibility always uses a fresh server request to Jupiter. The existing deployment's lite endpoint is retained; setting `JUPITER_API_KEY` selects the official keyed endpoint.
- `blockId` is resolved through Solana `getBlockTime`. Missing block time, a token quote older than 120 seconds, nonpositive prices or unavailable sources prevent issuance.
- `fetchedAtMs` is the time we queried the source. `sourceUpdatedAtMs` is token block time (Jupiter) or feed publication time (Pyth). `stockRefUpdatedAtMs` belongs only to the underlying equity reference; it may be a closing price.
- Pyth supplies market-hours metadata. Optional existing `PYTH_API_KEY` enables the AAPLx dashboard feed with Jupiter fallback. The coupon still uses Jupiter and its returned calculation is authoritative.
- Source failures are visible; missing data is never substituted with invented prices or discounts.

## Run locally

Requires **Node 24**.

```sh
npm ci
cp .env.local.example .env.local
# Configure RPC and a random COUPON_SECRET of at least 32 bytes.
npm run dev
```

On PowerShell, use `Copy-Item .env.local.example .env.local`.
Never commit real keys or wallet secrets. Generate the HMAC secret with:
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

The public RPC fallback is best-effort; reliable demos need an RPC that supports parsed Token-2022 accounts and block times. Restrict the browser RPC credential appropriately. A separate `SOLANA_RPC_URL` keeps the server RPC credential out of browser bundles.

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

## API changes

- `POST /api/coupon/challenge`: JSON `{wallet, tickers}`. Returns `{challenge, message, expiresAt}`. Sign the exact UTF-8 message using the matching wallet. The server HMAC binds domain, wallet, sorted tickers, random nonce and a five-minute validity period.
- `POST /api/coupon`: JSON `{challenge, signature}`, with a standard base64 Ed25519 signature. Returns `{token, lines, wallet, issuedAt, expiresAt, demo:true}`. Client-supplied wallets, percentages and tiers are rejected.
- `GET /api/price`: prices with source, separate observation/source/reference timestamps and stale state, plus optional market hours. Returns 503 if no quote can be treated as recent.
- `/verify?c=...`: validates the version-2 coupon's signature, schema and expiry. Version-1 coupons are intentionally rejected because their eligibility was not authenticated.

Signing purposes are separated between challenges and coupons. Responses use `no-store`; request bodies are bounded to 8 KiB. Invalid inputs return 4xx, upstream/configuration failures return a safe 503.

## Delivery and limitations

[Submission copy](docs/SUBMISSION.md) · [Video script](docs/VIDEO.md) · [Release checklist](docs/RELEASE.md)

Tests exercise cryptography with generated test-only Ed25519 keys, mocked upstream boundaries and React hooks. They do not replace a manual Phantom test with the team's real wallet.

Next.js, React, Tailwind, Solana libraries, Pyth's Hermes client and react-qr-code are open-source components used by this project. Vitest and Testing Library provide automated checks. A production commercial pilot would additionally require merchant agreements, campaign budgets, abuse controls, a redemption ledger and an appropriate operating/compliance model.

## References

- [Stocklana rules](https://hackathons.solana.com/hackathons/stocklana)
- [Jupiter price API and blockId recency](https://developers.jup.ag/docs/price)
- [xStocks integration and supported chains](https://xstocks.com/partner)
- [xStocks product rights](https://www.kraken.com/legal/xstocks)
