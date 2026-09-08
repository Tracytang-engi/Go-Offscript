import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, allowAttempt, saveClaim } from '@go-offscript/early-bird-api/storage';
import { InputError, validateClaim } from '@go-offscript/early-bird-api/validation';
import { isClaim } from '../../../lib/claim-client.mjs';
export const runtime = 'nodejs';
export const maxDuration = 60;

function json(body: object, status = 200) { return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } }); }

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const log = (event: string, extra = {}) => console.info(JSON.stringify({ event, requestId, ...extra }));
  try {
    const origin = req.headers.get('origin');
    if (origin && origin !== req.nextUrl.origin && new URL(origin).host !== req.headers.get('host')) return json({ success: false, message: 'Please submit the form from this website.' }, 403);
    if (req.headers.get('content-type')?.split(';')[0] !== 'application/json') return json({ success: false, message: 'Invalid submission.' }, 415);
    if (Number(req.headers.get('content-length') || 0) > 2048) return json({ success: false, message: 'Submission too large.' }, 413);
    const text = await req.text();
    if (new TextEncoder().encode(text).length > 2048) return json({ success: false, message: 'Submission too large.' }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({ success: false, message: 'Invalid submission.' }, 400); }
    const { email } = validateClaim(body);
    await ensureSchema();
    const ip = req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || (process.env.VERCEL ? 'unknown' : 'local');
    if (!await allowAttempt(ip)) return json({ success: false, message: 'Too many attempts. Please try again in an hour.' }, 429);
    const backend = process.env.EARLY_BIRD_BACKEND_URL;
    const secret = process.env.CLAIM_PROXY_SECRET;
    if (backend && secret) {
      try {
        const response = await fetch(`${backend.replace(/\/$/, '')}/api/claims`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Claim-Secret': secret, 'X-Request-Id': requestId },
          body: JSON.stringify({ email, consent: true }), cache: 'no-store', signal: AbortSignal.timeout(6000),
        });
        const data = await response.json();
        if (response.ok && isClaim(data)) { log('claim_saved', { path: 'render' }); return json(data); }
        log('render_fallback', { status: response.status });
      } catch { log('render_fallback', { reason: 'unavailable_or_timeout' }); }
    }
    // Same DB, same atomic unique constraint, same voucher, even if Render commits late.
    const claim = await saveClaim(email);
    log('claim_saved', { path: 'direct_database' });
    return json({ success: true, ...claim });
  } catch (error) {
    if (error instanceof InputError) return json({ success: false, message: error.message }, 400);
    log('claim_save_failed');
    return json({ success: false, message: 'We could not confirm your voucher yet. Please try again.', requestId }, 503);
  }
}
