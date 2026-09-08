import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';

test('API never reports success when database save fails; requires proxy authentication', async t => {
  process.env.CLAIM_PROXY_SECRET = 'test-secret-do-not-use-in-production';
  let saved = 0;
  const server = createApp({ready:async()=>{},save:async()=>{saved++;throw new Error('offline');}}).listen(0, '127.0.0.1');
  await once(server,'listening'); t.after(()=>server.close());
  const url = `http://127.0.0.1:${server.address().port}/api/claims`;
  const request = secret => fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-Claim-Secret':secret},body:JSON.stringify({email:'a@example.com',consent:true})});
  assert.equal((await request('wrong')).status,403);
  assert.equal(saved,0);
  const response = await request(process.env.CLAIM_PROXY_SECRET);
  assert.equal(response.status,503); assert.equal((await response.json()).success,false); assert.equal(saved,1);
});
