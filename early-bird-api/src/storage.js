import pg from 'pg';
import { randomBytes, createHash } from 'node:crypto';
import { normalizeEmail, CAMPAIGN } from './validation.js';

let pool;
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if (pool) return pool;
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    statement_timeout: 7000,
    application_name: 'go-offscript-early-bird',
  });
  pool.on('error', () => console.error(JSON.stringify({ event: 'database_pool_error' })));
  return pool;
}

// Separate tables: never change or delete the original waitlist or account data.
export const migration = `
CREATE TABLE IF NOT EXISTS early_bird_claims (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  campaign TEXT NOT NULL,
  email TEXT NOT NULL,
  voucher_code TEXT NOT NULL UNIQUE,
  consent_version TEXT NOT NULL DEFAULT 'early-bird-v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMPTZ,
  UNIQUE (campaign, email)
);
CREATE TABLE IF NOT EXISTS early_bird_rate_limits (
  bucket TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (bucket, window_start)
);`;

export async function migrate(db = getPool()) {
  // Shared advisory lock makes concurrent Vercel / Render startup safe.
  const connection = await db.connect();
  try {
    await connection.query('BEGIN');
    await connection.query('SELECT pg_advisory_xact_lock(728416903)');
    await connection.query(migration);
    await connection.query('COMMIT');
  } catch (error) {
    await connection.query('ROLLBACK');
    throw error;
  } finally { connection.release(); }
}

let ready;
export function ensureSchema() {
  ready ??= migrate().catch(error => { ready = undefined; throw error; });
  return ready;
}

export async function saveClaim(email, db = getPool()) {
  const normalized = normalizeEmail(email);
  const voucher = `GOS-${randomBytes(12).toString('hex').toUpperCase()}`;
  // One atomic upsert. A response lost after commit is safe to retry: same voucher.
  const { rows } = await db.query(`
    INSERT INTO early_bird_claims (campaign, email, voucher_code)
    VALUES ($1, $2, $3)
    ON CONFLICT (campaign, email) DO UPDATE SET email = EXCLUDED.email
    RETURNING voucher_code, created_at`, [CAMPAIGN, normalized, voucher]);
  return { voucherCode: rows[0].voucher_code, savedAt: new Date(rows[0].created_at).toISOString(), campaign: CAMPAIGN };
}

export async function allowAttempt(ip, db = getPool()) {
  if (!process.env.CLAIM_PROXY_SECRET) throw new Error('CLAIM_PROXY_SECRET is required');
  const bucket = createHash('sha256').update(`${process.env.CLAIM_PROXY_SECRET}:${ip}`).digest('hex');
  const { rows } = await db.query(`
    INSERT INTO early_bird_rate_limits (bucket, window_start) VALUES ($1, date_trunc('hour', now()))
    ON CONFLICT (bucket, window_start) DO UPDATE SET attempts = early_bird_rate_limits.attempts + 1
    RETURNING attempts`, [bucket]);
  // Bound stored rate-limit metadata; no raw IP addresses are saved.
  await db.query("DELETE FROM early_bird_rate_limits WHERE window_start < now() - interval '48 hours'");
  return rows[0].attempts <= 300;
}

export async function closePool() { if (pool) await pool.end(); pool = undefined; ready = undefined; }
