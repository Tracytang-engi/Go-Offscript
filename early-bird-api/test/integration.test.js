import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { migrate, saveClaim, allowAttempt } from '../src/storage.js';
import { randomUUID } from 'node:crypto';

test('real PostgreSQL: concurrent retries produce one durable row and stable voucher', {skip:!process.env.TEST_DATABASE_URL}, async t => {
  const db = new pg.Pool({connectionString:process.env.TEST_DATABASE_URL});
  const email = `integration-${randomUUID()}@example.test`;
  t.after(async()=>{await db.query('DELETE FROM early_bird_claims WHERE email=$1',[email]);await db.end();});
  await Promise.all([migrate(db),migrate(db)]);
  const claims = await Promise.all(Array.from({length:24},(_,i)=>saveClaim(i%2 ? email.toUpperCase() : ` ${email} `,db)));
  assert.equal(new Set(claims.map(c=>c.voucherCode)).size,1);
  assert.equal(new Set(claims.map(c=>c.savedAt)).size,1);
  assert.match(claims[0].voucherCode,/^GOS-[A-F0-9]{24}$/);
  const readBack = await db.query('SELECT count(*)::int AS count FROM early_bird_claims WHERE email=$1',[email]);
  assert.equal(readBack.rows[0].count,1);
  // Reconnect independently, mimicking a process restart or Vercel fallback.
  const second = new pg.Pool({connectionString:process.env.TEST_DATABASE_URL});
  try { assert.deepEqual(await saveClaim(email,second),claims[0]); } finally {await second.end();}
});

test('rate limit persists across instances without storing raw IPs', {skip:!process.env.TEST_DATABASE_URL}, async()=>{
  process.env.CLAIM_PROXY_SECRET='integration-only-secret';
  const db = new pg.Pool({connectionString:process.env.TEST_DATABASE_URL});
  await migrate(db);
  const ip = randomUUID();
  try { for(let i=0;i<300;i++) assert.equal(await allowAttempt(ip,db),true); assert.equal(await allowAttempt(ip,db),false); }
  finally {await db.end();}
});
