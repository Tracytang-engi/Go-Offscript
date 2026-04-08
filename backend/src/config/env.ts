import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? 'fallback_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? '',
  PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ?? '',
  PERPLEXITY_GROUP_ID: process.env.PERPLEXITY_GROUP_ID ?? '',
} as const;
