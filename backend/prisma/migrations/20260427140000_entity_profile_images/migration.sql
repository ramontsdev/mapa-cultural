-- Avatar (logo/perfil) e capa (banner) para entidades públicas, alinhado ao Mapas Culturais.

ALTER TABLE "agent" ADD COLUMN "avatar_url" TEXT;
ALTER TABLE "agent" ADD COLUMN "cover_url" TEXT;

ALTER TABLE "space" ADD COLUMN "avatar_url" TEXT;
ALTER TABLE "space" ADD COLUMN "cover_url" TEXT;

ALTER TABLE "project" ADD COLUMN "avatar_url" TEXT;
ALTER TABLE "project" ADD COLUMN "cover_url" TEXT;

ALTER TABLE "event" ADD COLUMN "avatar_url" TEXT;
ALTER TABLE "event" ADD COLUMN "cover_url" TEXT;

ALTER TABLE "opportunity" ADD COLUMN "avatar_url" TEXT;
ALTER TABLE "opportunity" ADD COLUMN "cover_url" TEXT;
