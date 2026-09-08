import test from 'node:test';
import assert from 'node:assert/strict';
import { claimVoucher } from '../lib/claim-client.mjs';
const payload={email:'test@example.com',consent:true,website:''};
const valid={success:true,voucherCode:'GOS-'+'A'.repeat(24),savedAt:'2026-09-07T00:00:00Z',campaign:'early-bird-bonus-v1'};
const response=(status,body)=>new Response(JSON.stringify(body),{status});
test('retries a lost response without changing the submitted address',async()=>{
  let calls=0;const bodies=[];
  const result=await claimVoucher(payload,()=>{},{sleep:async()=>{},fetchImpl:async(_url,init)=>{bodies.push(init.body);if(++calls===1)throw new TypeError('network');return response(200,valid);}});
  assert.equal(calls,2);assert.equal(new Set(bodies).size,1);assert.deepEqual(result,valid);
});
test('never turns an error or malformed 200 into congratulations',async()=>{
  for(const body of [{success:true},{...valid,voucherCode:'fake'},{...valid,success:false}]){
    let calls=0;await assert.rejects(claimVoucher(payload,()=>{},{sleep:async()=>{},fetchImpl:async()=>{calls++;return response(200,body);}}));assert.equal(calls,3);
  }
});
test('validation and rate-limit failures are not automatically retried',async()=>{
  for(const status of [400,403,429]){let calls=0;await assert.rejects(claimVoucher(payload,()=>{},{sleep:async()=>{},fetchImpl:async()=>{calls++;return response(status,{message:'try later'});}}),/try later/);assert.equal(calls,1);}
});
test('all attempts failing leaves the claim unconfirmed',async()=>{
  let calls=0;await assert.rejects(claimVoucher(payload,()=>{},{sleep:async()=>{},fetchImpl:async()=>{calls++;return response(503,{success:false});}}),/not been confirmed/);assert.equal(calls,3);
});
