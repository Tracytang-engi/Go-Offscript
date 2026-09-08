declare module '@go-offscript/early-bird-api/storage' {
  export function ensureSchema(): Promise<void>;
  export function saveClaim(email: string): Promise<{ voucherCode: string; savedAt: string; campaign: string }>;
  export function allowAttempt(ip: string): Promise<boolean>;
}
declare module '@go-offscript/early-bird-api/validation' {
  export class InputError extends Error {}
  export function validateClaim(value: unknown): { email: string; campaign: string };
}
