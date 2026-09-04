/**
 * Public landing origin for Privacy / Terms / Support links.
 */
export const LANDING_ORIGIN = 'https://go-offscript.vercel.app';

export const LEGAL_LINKS = {
  privacy: `${LANDING_ORIGIN}/privacy`,
  terms: `${LANDING_ORIGIN}/terms`,
  support: `${LANDING_ORIGIN}/support`,
  contactEmail: 'gooffscript6@gmail.com',
  contactMailto: 'mailto:gooffscript6@gmail.com',
} as const;
