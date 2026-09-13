import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '1 Week Free Trial — Go Offscript',
  description: 'Reserve your 1 week free trial of Go Offscript for launch. Explore career paths, real opportunities and mentors with Nova.',
  robots: { index: true, follow: true },
};
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
