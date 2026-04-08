import './config/env';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const start = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(env.PORT, () => {
      console.log(`Go Off Script API running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
