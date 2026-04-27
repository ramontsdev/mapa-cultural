-- CreateEnum
CREATE TYPE "MediaOwnerType" AS ENUM ('AGENT', 'SPACE', 'PROJECT', 'EVENT', 'OPPORTUNITY');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateTable
CREATE TABLE "media_asset" (
    "id" TEXT NOT NULL,
    "owner_type" "MediaOwnerType" NOT NULL,
    "owner_id" VARCHAR(36) NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "title" VARCHAR(512),
    "caption" TEXT,
    "file_name" VARCHAR(512),
    "mime_type" VARCHAR(255),
    "s3_key" VARCHAR(1024),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "create_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_owner_sort_idx" ON "media_asset"("owner_type", "owner_id", "sort_order");
