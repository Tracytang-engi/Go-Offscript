import type { NextConfig } from 'next';
import path from 'node:path';
const config: NextConfig = {
  transpilePackages: ['@go-offscript/early-bird-api'],
  outputFileTracingRoot: path.join(process.cwd(), '..'),
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
    ] }];
  }
};
export default config;
