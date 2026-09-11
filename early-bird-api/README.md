# Early Bird Bonus API

The recommended deployment now mounts this shared code in the existing `backend` service. Follow [the integration guide](../backend/EARLY_BIRD.md); no additional Render service is required. The standalone instructions below remain an optional alternative.

Independent Render service for the Early Bird Bonus campaign. Original `backend` and `landing` remain separate. This API and the Vercel fallback share `src/storage.js`, one PostgreSQL database, and the `early_bird_claims` table.

## Production setup

1. Back up the existing database. Use a paid PostgreSQL instance that will not expire. Reuse an existing database if desired: migrations only create `early_bird_claims` and `early_bird_rate_limits`.
2. In Render, create `go-offscript-early-bird-api` from this repository with root directory `early-bird-api`, build `npm ci`, start `npm start`, health path `/health`. `render.yaml` documents the Starter plan to avoid idle sleep. Review the service's price before creation.
3. Set `DATABASE_URL`, `CLAIM_PROXY_SECRET` and `ADMIN_KEY`. Both secrets must be random strings of at least 32 characters. Set `NODE_ENV=production`.
4. The Vercel project uses the same database and proxy secret. Its database URL must be externally reachable with appropriate TLS configuration. Do not disable TLS certificate verification.
5. Never expose these environment variables with a `NEXT_PUBLIC_` prefix or commit them.

The service creates tables using a transaction and advisory lock on startup health checks. It refuses to report healthy if initialization fails. PostgreSQL uniqueness enforces one stable voucher per normalized email and campaign, including retries that arrive after a response was lost.

## Export and fulfilment

`GET /api/claims/export` with the `x-admin-key` header returns all claims as CSV with email, voucher code, creation time and redemption time. Store exports privately. Export daily or before any migration. Use the database provider's backups too; do not treat application logs as an email backup.

Token amount is intentionally unspecified. The campaign records a voucher entitlement, not an immediate token balance. Before fulfilment, require the user to verify ownership of the same email in the main application, enforce one redemption per account/campaign, and update redemption status atomically with the token ledger. A voucher code alone must never authorize credit. No automatic token grant or redemption endpoint is implemented.

The form accepts re-confirmation without requiring the email to exist in the original waitlist, since the campaign is intended to recover missing early-interest registrations. Existing original offers are preserved by the campaign copy.

## Checks

`npm test` runs validation and API failure tests. `TEST_DATABASE_URL=... npm run test:integration` exercises real PostgreSQL with 24 concurrent submissions, reconnect readback, concurrent migration and persistent rate limits. Use an isolated test database. Integration claims are cleaned up by their exact generated email; no broad deletion is performed.

Logs include request IDs, outcome and persistence path, never email, voucher, database URL or secrets. The rate limiter stores salted hashes, not raw IPs, for up to 48 hours. Deleting a user's data should include their row in `early_bird_claims`.
