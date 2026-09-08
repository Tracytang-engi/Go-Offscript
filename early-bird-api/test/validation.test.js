import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, validateClaim, InputError } from '../src/validation.js';

test('normalizes email while preserving plus aliases', () => {
  assert.equal(normalizeEmail('  Student+Bonus@Cam.Ac.Uk '), 'student+bonus@cam.ac.uk');
});
test('rejects invalid, oversized and non-string input', () => {
  for (const email of [null, [], {}, '', 'not-an-email', 'a@b', '.a@example.com', 'a..b@example.com', 'a@-host.com', 'a'.repeat(65)+'@example.com', 'a\n@example.com']) {
    assert.throws(() => normalizeEmail(email), InputError);
  }
});
test('requires affirmative consent and rejects honeypot', () => {
  for (const body of [{ email:'a@example.com' }, { email:'a@example.com', consent:'true' }, { email:'a@example.com', consent:true, website:'bot' }]) assert.throws(()=>validateClaim(body), InputError);
  assert.equal(validateClaim({email:'A@example.com',consent:true}).email, 'a@example.com');
});
