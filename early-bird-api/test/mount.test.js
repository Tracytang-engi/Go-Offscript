import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { once } from 'node:events';
const { createApp } = process.env.EARLY_BIRD_TEST_COMPILED === '1'
  ? await import('../../backend/generated/early-bird/app.js')
  : await import('../src/app.js');

test('mounted claims retain authentication, body limits and isolation from waitlist', async t => {
  process.env.CLAIM_PROXY_SECRET = 'integration-secret-at-least-32-characters';
  const emails = new Map();
  const app = express();
  app.use('/api/claims', createApp({basePath: '', ready: async () => {}, save: async email => {
    if (!emails.has(email)) emails.set(email, {voucherCode: 'GOS-0123456789ABCDEF01234567', savedAt: new Date().toISOString(), campaign: 'early-bird-bonus-v1'});
    return emails.get(email);
  }}));
  app.use(express.json());
  let waitlistRequests = 0;
  app.post('/api/waitlist', (_req, res) => { waitlistRequests++; res.json({success:true}); });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body, secret = process.env.CLAIM_PROXY_SECRET) => fetch(base + path, {
    method: 'POST', headers: {'Content-Type':'application/json','X-Claim-Secret':secret}, body:JSON.stringify(body),
  });
  const body = {email:'same@example.com',consent:true};
  assert.equal((await post('/api/waitlist',body)).status,200);
  assert.equal((await post('/api/claims',body,'wrong')).status,403);
  assert.equal(emails.size,0);
  const claim = await (await post('/api/claims',body)).json();
  assert.equal(claim.success,true);
  assert.deepEqual(await (await post('/api/claims',body)).json(),claim);
  assert.equal((await post('/api/claims',{...body,extra:'x'.repeat(3000)})).status,413);
  assert.equal((await fetch(base+'/api/claims/health')).status,200);
  assert.equal(waitlistRequests,1);
  assert.equal(emails.size,1);
});
