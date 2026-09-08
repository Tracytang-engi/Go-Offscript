// Explicit local-only end-to-end probe. Never sends synthetic claims to production.
import assert from 'node:assert/strict';
const url = process.env.TEST_SITE_URL || 'http://localhost:3002';
if (!['localhost','127.0.0.1'].includes(new URL(url).hostname)) throw new Error('Local tests only');
const email = process.env.TEST_CLAIM_EMAIL || `local-${crypto.randomUUID()}@example.test`;
const send = body => fetch(`${url}/api/claim`, {method:'POST',headers:{'Content-Type':'application/json',Origin:url},body:JSON.stringify(body)});
const first = await send({email,consent:true});
assert.equal(first.status,200);const saved=await first.json();assert.equal(saved.success,true);
assert.match(saved.voucherCode,/^GOS-[A-F0-9]{24}$/);
const responses = await Promise.all(Array.from({length:10},(_,i)=>send({email:i%2?email.toUpperCase():email,consent:true})));
for(const response of responses){assert.equal(response.status,200);assert.deepEqual(await response.json(),saved);}
assert.equal((await send({email,consent:false})).status,400);
assert.equal((await send({email:'bad',consent:true})).status,400);
assert.equal((await send({email,consent:true,website:'bot'})).status,400);
const crossOrigin=await fetch(`${url}/api/claim`,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://unrelated.example'},body:JSON.stringify({email,consent:true})});
assert.equal(crossOrigin.status,403);
console.log(JSON.stringify({result:'passed',email,voucher:saved.voucherCode,checks:['save','ten_concurrent_retries','same_voucher','consent','invalid_email','honeypot','origin']}));
