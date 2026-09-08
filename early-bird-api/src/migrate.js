import { migrate, closePool } from './storage.js';
try { await migrate(); console.info('Early Bird tables ready'); } finally { await closePool(); }
