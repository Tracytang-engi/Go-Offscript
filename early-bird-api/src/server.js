import { createApp } from './app.js';
import { closePool } from './storage.js';

for (const name of ['DATABASE_URL', 'CLAIM_PROXY_SECRET', 'ADMIN_KEY']) {
  if (!process.env[name] || (name !== 'DATABASE_URL' && process.env[name].length < 32)) throw new Error(`Missing or weak ${name}`);
}
const server = createApp().listen(Number(process.env.PORT || 3001), '0.0.0.0', () => console.info('Early Bird API listening'));
process.on('SIGTERM', () => server.close(async () => { await closePool(); process.exit(0); }));
