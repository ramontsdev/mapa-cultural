-- Alinha `opportunity` ao modelo Prisma (`long_description`).

ALTER TABLE "opportunity" ADD COLUMN IF NOT EXISTS "long_description" TEXT;
