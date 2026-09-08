export function isClaim(value) {
  return value?.success === true && /^GOS-[A-F0-9]{24}$/.test(value.voucherCode) && typeof value.savedAt === 'string' && Number.isFinite(Date.parse(value.savedAt)) && value.campaign === 'early-bird-bonus-v1';
}

export async function claimVoucher(payload, update = () => {}, { fetchImpl = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), timeoutMs = 25000 } = {}) {
  const requestId = crypto.randomUUID();
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl('/api/claim', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(timeoutMs),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && isClaim(data)) return data;
      if (response.status >= 400 && response.status < 500 && response.status !== 408) {
        const error = new Error(data?.message || 'Please check your email and try again.');
        error.noRetry = true;
        throw error;
      }
      throw new Error('Your voucher has not been confirmed yet. Your email is still in the form — please try again.');
    } catch (error) {
      if (error.noRetry || attempt === 2) throw error.name === 'TimeoutError' || error instanceof TypeError ? new Error('We could not confirm your voucher. Your email is still in the form — please try again.') : error;
      update('Still saving your spot. We are safely retrying — keep this page open.');
      await sleep((attempt + 1) * 1500);
    }
  }
}
