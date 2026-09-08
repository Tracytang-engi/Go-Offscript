export const CAMPAIGN = 'early-bird-bonus-v1';

export class InputError extends Error {}

export function normalizeEmail(value) {
  if (typeof value !== 'string') throw new InputError('Please enter a valid email address.');
  const email = value.trim().toLowerCase();
  const local = email.split('@')[0];
  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email) || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    throw new InputError('Please enter a valid email address.');
  }
  return email;
}

export function validateClaim(body) {
  if (!body || body.consent !== true) throw new InputError('Please agree to receive your voucher and early-access updates.');
  if (body.website) throw new InputError('We could not accept this submission. Please try again.');
  return { email: normalizeEmail(body.email), campaign: CAMPAIGN };
}
