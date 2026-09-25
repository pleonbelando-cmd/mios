# Stocklana submission — copy ready for review

## Project

MIOS

## One-liner

MIOS turns verified tokenized-stock holdings on Solana into demonstrable shopping benefits.

## Description

Tokenized stocks can connect investment portfolios to everyday experiences. MIOS explores how a participating merchant could offer a benefit to a customer based on a verifiable position, without taking custody of their assets.

Connect a Solana wallet, view five supported xStocks, and discover the illustrative benefit associated with each position. Choose products in a demonstration marketplace, sign a readable message, and receive a QR coupon after the server checks wallet control, current holdings and recent token prices.

Benefits are calculated independently for each asset: positions of $500, $2,000 and $10,000 qualify for illustrative discounts of 5%, 10% and 15%. A coupon is a signed record of eligibility at issuance, valid for verification for 24 hours.

## Why Solana?

Solana provides publicly readable token accounts and interoperable wallet standards. MIOS reads Token-2022 accounts, including scaled UI balances, and aggregates multiple accounts belonging to the same wallet. Users retain custody; the proof is a message signature, not a transaction. xStocks are also available on other networks: this project deliberately implements the Solana experience.

## Data integrations

Jupiter supplies token prices and the underlying-equity reference where available. We use the token quote's block ID and Solana block time to check recency. Pyth supplies market-hours metadata; an optional configured Pyth feed can provide the AAPLx dashboard quote. Coupon valuation uses Jupiter. We do not claim that Pyth is the primary pricing engine.

## What works, and what is simulated?

Real: mainnet portfolio reads, wallet-signature verification, server-side benefit calculations, quote recency checks and HMAC-signed QR verification.

Illustrative: merchant campaigns, generic products and shopping totals. There are no brand partnerships asserted, payments, integrated trading, minimum holding periods or commercial coupon redemption. Coupons are not single-use.

## Who could use it?

The intended users are tokenized-stock holders and merchants willing to test portfolio-based customer benefits. Commercial demand, merchant funding and campaign economics remain to be validated through a pilot.

## Next milestone

Agree one bounded campaign with a merchant, establish its budget and eligibility rules, and add single-use redemption with measurable conversion and cost per redeemed benefit.

## Links and team — complete before submitting

- Repository: https://github.com/pleonbelando-cmd/mios
- Existing production URL: https://mios-omega.vercel.app — verify the approved commit is deployed before submitting this version.
- Video URL: **PENDING RECORDING / UPLOAD**
- Team member names and portal accounts: **CONFIRM WITH PEPE**
- Portal confirmation: **NOT SUBMITTED BY THIS DOCUMENT**

Primary target: main track / consumer use case. Do not claim additional bounty eligibility without checking the actual integration against its criteria.

## Open-source attribution

Next.js, React, Tailwind CSS, Solana web3.js/SPL Token/wallet-adapter, Pyth Hermes client and react-qr-code underpin the application. Vitest and Testing Library are used for tests. This project builds on these components; it does not claim to have created them.
