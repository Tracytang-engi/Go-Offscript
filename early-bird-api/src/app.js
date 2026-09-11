import express from 'express';
import { timingSafeEqual } from 'node:crypto';
import { validateClaim, InputError } from './validation.js';
import { ensureSchema, saveClaim, getPool } from './storage.js';

function matches(actual, expected) {
  if (typeof actual !== 'string' || !expected) return false;
  const a = Buffer.from(actual), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createApp({ save = saveClaim, ready = ensureSchema, basePath = '/api/claims' } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2kb' }));
  app.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); res.set('X-Content-Type-Options', 'nosniff'); next(); });
  app.get('/health', async (_req, res) => {
    try { await ready(); res.json({ status: 'ok' }); }
    catch { res.status(503).json({ status: 'unavailable' }); }
  });
  app.post(basePath || '/', async (req, res) => {
    if (!matches(req.headers['x-claim-secret'], process.env.CLAIM_PROXY_SECRET)) return res.sendStatus(403);
    try {
      const { email } = validateClaim(req.body);
      await ready();
      const claim = await save(email);
      console.info(JSON.stringify({ event: 'claim_saved', campaign: claim.campaign, requestId: req.headers['x-request-id'] ?? null }));
      return res.status(200).json({ success: true, ...claim });
    } catch (error) {
      if (error instanceof InputError) return res.status(400).json({ success: false, message: error.message });
      console.error(JSON.stringify({ event: 'claim_save_failed', requestId: req.headers['x-request-id'] ?? null }));
      return res.status(503).json({ success: false, message: 'Your voucher has not been confirmed yet. Please try again.' });
    }
  });
  app.get(`${basePath}/export`, async (req, res) => {
    if (!matches(req.headers['x-admin-key'], process.env.ADMIN_KEY)) return res.sendStatus(403);
    try {
      await ready();
      const { rows } = await getPool().query('SELECT email, voucher_code, created_at, redeemed_at FROM early_bird_claims ORDER BY created_at');
      const cell = v => `"${String(v ?? '').replace(/^[=+\-@\t\r]/, "'$&").replaceAll('"', '""')}"`;
      res.type('text/csv').attachment('early-bird-claims.csv').send(['email,voucher_code,created_at,redeemed_at', ...rows.map(r => [r.email, r.voucher_code, r.created_at.toISOString(), r.redeemed_at?.toISOString()].map(cell).join(','))].join('\r\n'));
    } catch { res.status(503).json({ success: false }); }
  });
  app.use((error, _req, res, _next) => {
    res.status(error.type === 'entity.too.large' ? 413 : 400).json({ success: false, message: 'Please check your submission.' });
  });
  return app;
}
