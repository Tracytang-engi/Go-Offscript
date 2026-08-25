-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "age" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "school" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "portraitBullets" JSONB;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "chatSummary" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "saveChatHistory" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "likedPathTitles" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "skippedPathTitles" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "pathSnapshot" JSONB;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "connectedPlatforms" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_saved_opportunities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientKey" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_saved_opportunities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_saved_mentors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientKey" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "savedMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_saved_mentors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- Indexes / uniques
CREATE UNIQUE INDEX IF NOT EXISTS "user_saved_opportunities_userId_clientKey_key" ON "user_saved_opportunities"("userId", "clientKey");
CREATE INDEX IF NOT EXISTS "user_saved_opportunities_userId_idx" ON "user_saved_opportunities"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "user_saved_mentors_userId_clientKey_key" ON "user_saved_mentors"("userId", "clientKey");
CREATE INDEX IF NOT EXISTS "user_saved_mentors_userId_idx" ON "user_saved_mentors"("userId");

CREATE INDEX IF NOT EXISTS "chat_messages_userId_sessionKey_idx" ON "chat_messages"("userId", "sessionKey");

-- FKs
DO $$ BEGIN
  ALTER TABLE "user_saved_opportunities" ADD CONSTRAINT "user_saved_opportunities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "user_saved_mentors" ADD CONSTRAINT "user_saved_mentors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
