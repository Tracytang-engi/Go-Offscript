# Early Bird Bonus

An independent orange-led candy-colour campaign page for Go Offscript, with the original six product features and three app walkthroughs. Claim confirmation includes a voucher and a short confetti animation. Reduced-motion preference and a pause control are supported.

## Vercel deployment

- Import `Tracytang-engi/Go-Offscript` as a **new project** named `go-offscript-early-bird-bonus`.
- Root directory: `early-bird-bonus`.
- Enable **Include source files outside of the Root Directory in the Build Step**, because the local dependency `@go-offscript/early-bird-api` shares storage and validation with the sibling Render backend.
- Install `npm ci --prefix ../early-bird-api && npm ci`; build `npm run build`; Next.js framework preset. The sibling package is linked by npm, so its dependencies must also be installed in its own directory. These commands are configured in `vercel.json`.
- Set server-only `DATABASE_URL` (external PostgreSQL connection), `CLAIM_PROXY_SECRET` (same as Render) and `EARLY_BIRD_BACKEND_URL` (the new Render service URL).
- The database must be reachable from both Vercel and Render. Verify provider access rules and TLS. All claim requests fail closed when no database is configured.

## Storage reliability

1. Validate the email and explicit consent on the server; reject spam honeypot, oversized payloads, cross-origin browser submissions and excessive requests.
2. Try the independently hosted Render API for up to six seconds.
3. If it is slow, fails or returns malformed data, atomically save to the **same PostgreSQL table directly from Vercel**, using the exact same storage code. Render cold starts do not prevent collection while the database is available.
4. Only a validated database-confirmed response can trigger congratulations. A repeated email returns the original voucher and timestamp.
5. The browser retries transient failures up to three times and preserves the pending address in session storage. A browser-stored address is never proof of a successful claim.

Database outages can still prevent capture: the user sees an explicit unconfirmed state. No system can recover a never-persisted address after the visitor leaves and all available persistence paths fail.

## Local development

Run `npm install` in `../early-bird-api`, then `npm install` here. Copy `.env.example` to `.env.local` with development values. Run `npm run dev` on port 3002.

`npm test` exercises client retry and false-success handling. `node test/live-route.mjs` tests the local running API, concurrent retries, validation and origin protection. It refuses to target a non-local host. Run once with Render/backend unavailable and again with the local backend running. `npm run build` validates production compilation and types.

Voucher amount and deadline are intentionally unspecified. The campaign does not invent visitor counts, testimonials or a token amount. Privacy and support link back to the existing landing site, with additional campaign-specific storage details on this page.
