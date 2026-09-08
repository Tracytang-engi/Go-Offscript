export function isClaim(value: unknown): boolean;
export function claimVoucher(payload: { email: string; consent: boolean; website: string }, update?: (message: string) => void, options?: object): Promise<{ voucherCode: string; savedAt: string; campaign: string }>;
