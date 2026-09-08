import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Early Bird Bonus — Go Offscript',
  description: 'A little extra for your next chapter. Claim your extra tokens voucher and explore career paths, real opportunities and mentors with Nova.',
  robots: { index: true, follow: true },
};
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
