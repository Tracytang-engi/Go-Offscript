# Early Bird on the existing Render API

The existing backend mounts `/api/claims`, `/api/claims/export` and `/api/claims/health`.
Its build compiles the shared `../early-bird-api/src` files to `generated/early-bird`.
Keep the entire repository available during builds; no second Render service is needed.
`npm run build` includes this step; custom builds must run `npm run build:early-bird` before starting.

## Existing Render service

- Keep the existing `DATABASE_URL`, plan, root directory and start command.
- Add `CLAIM_PROXY_SECRET` equal to the Vercel project's value.
- For CSV exports set a strong `ADMIN_KEY` (at least 32 random characters). It is shared with the existing waitlist export, so preserve any existing valid admin key.
- Deploy the latest `main`. `/api/claims/health` must return `{"status":"ok"}`.
- If Render uses build filters, include `early-bird-api/**` as well as `backend/**` so shared-code changes redeploy the API.

## Vercel

Set Production `EARLY_BIRD_BACKEND_URL` to the **existing** Render API's HTTPS origin, without `/api/claims`.
Keep `DATABASE_URL` with external TLS settings and `CLAIM_PROXY_SECRET`. Redeploy.
Vercel logs `claim_saved` with `path: render` on successful API forwarding. `path: direct_database` means the fallback saved it instead.

The same `early_bird_claims` table and unique `(campaign,email)` constraint are used by both paths.
The original `/api/waitlist` and `waitlist_entries` are unchanged; there is no cross-table deduplication.
This integration does not implement voucher emails or token redemption.
