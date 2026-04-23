-- `_geo_location` no Mapas com PostGIS é `geography`; aqui TEXT para ambientes sem extensão postgis instalada.

-- CreateTable
CREATE TABLE "usr" (
    "id" TEXT NOT NULL,
    "auth_provider" INTEGER NOT NULL,
    "auth_uid" VARCHAR(512) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "last_login_timestamp" TIMESTAMP(3),
    "create_timestamp" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "profile_id" TEXT,

    CONSTRAINT "usr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subsite" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "create_timestamp" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "agent_id" TEXT NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "alias_url" VARCHAR(255),
    "verified_seals" JSONB,
    "namespace" VARCHAR(50) NOT NULL,

    CONSTRAINT "subsite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent" (
    "id" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "public_location" BOOLEAN,
    "location" point NOT NULL,
    "_geo_location" TEXT NOT NULL,
    "short_description" TEXT,
    "long_description" TEXT,
    "create_timestamp" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "parent_id" TEXT,
    "user_id" TEXT NOT NULL,
    "update_timestamp" TIMESTAMP(3),
    "subsite_id" TEXT,

    CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space" (
    "id" TEXT NOT NULL,
    "location" point NOT NULL,
    "_geo_location" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "public" BOOLEAN NOT NULL,
    "short_description" TEXT,
    "long_description" TEXT,
    "create_timestamp" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "agent_id" TEXT NOT NULL,
    "update_timestamp" TIMESTAMP(3),
    "subsite_id" TEXT,
    "parent_id" TEXT,

    CONSTRAINT "space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "short_description" TEXT,
    "long_description" TEXT,
    "update_timestamp" TIMESTAMP(3),
    "starts_on" TIMESTAMP(3),
    "ends_on" TIMESTAMP(3),
    "create_timestamp" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "subsite_id" TEXT,
    "parent_id" TEXT,
    "agent_id" TEXT NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "type" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "short_description" TEXT NOT NULL DEFAULT '',
    "long_description" TEXT,
    "rules" TEXT,
    "create_timestamp" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "agent_id" TEXT NOT NULL,
    "project_id" TEXT,
    "update_timestamp" TIMESTAMP(3),
    "subsite_id" TEXT,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_occurrence" (
    "id" TEXT NOT NULL,
    "starts_on" DATE,
    "ends_on" DATE,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "frequency" TEXT,
    "separation" INTEGER NOT NULL DEFAULT 1,
    "count" INTEGER,
    "until" DATE,
    "description" TEXT,
    "price" TEXT,
    "priceInfo" TEXT,
    "timezone_name" TEXT NOT NULL DEFAULT 'Etc/UTC',
    "event_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "event_occurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity" (
    "id" TEXT NOT NULL,
    "object_type" TEXT NOT NULL,
    "object_id" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "short_description" TEXT NOT NULL,
    "registration_from" TIMESTAMP(3) NOT NULL,
    "registration_to" TIMESTAMP(3) NOT NULL,
    "published_registrations" BOOLEAN NOT NULL DEFAULT false,
    "registration_categories" JSONB,
    "create_timestamp" TIMESTAMP(3) NOT NULL,
    "update_timestamp" TIMESTAMP(3),
    "publish_timestamp" TIMESTAMP(3),
    "auto_publish" BOOLEAN NOT NULL DEFAULT false,
    "status" INTEGER NOT NULL,
    "registration_proponent_types" JSONB NOT NULL,
    "registration_ranges" JSONB,
    "parent_id" TEXT,
    "agent_id" TEXT NOT NULL,
    "subsite_id" TEXT,

    CONSTRAINT "opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_step" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "opportunity_id" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "create_timestamp" TIMESTAMP(3) NOT NULL,
    "update_timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration" (
    "id" TEXT NOT NULL,
    "number" VARCHAR(24),
    "category" VARCHAR(255),
    "opportunity_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "create_timestamp" TIMESTAMP(3) NOT NULL,
    "sent_timestamp" TIMESTAMP(3),
    "agents_data" JSONB,
    "consolidated_result" VARCHAR(255),
    "space_data" JSONB,
    "status" INTEGER NOT NULL,
    "proponent_type" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "valuers_exceptions_list" JSONB NOT NULL,
    "valuers" JSONB NOT NULL,
    "subsite_id" TEXT,
    "score" DOUBLE PRECISION,
    "eligible" BOOLEAN,
    "editable_until" TIMESTAMP(3),
    "edit_sent_timestamp" TIMESTAMP(3),
    "editable_fields" JSONB,
    "update_timestamp" TIMESTAMP(3),

    CONSTRAINT "registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usr_profile_id_key" ON "usr"("profile_id");

-- CreateIndex
CREATE INDEX "opportunity_entity_idx" ON "opportunity"("object_type", "object_id");

-- AddForeignKey
ALTER TABLE "usr" ADD CONSTRAINT "usr_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subsite" ADD CONSTRAINT "subsite_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent" ADD CONSTRAINT "agent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usr"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent" ADD CONSTRAINT "agent_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent" ADD CONSTRAINT "agent_subsite_id_fkey" FOREIGN KEY ("subsite_id") REFERENCES "subsite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space" ADD CONSTRAINT "space_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space" ADD CONSTRAINT "space_subsite_id_fkey" FOREIGN KEY ("subsite_id") REFERENCES "subsite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space" ADD CONSTRAINT "space_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_subsite_id_fkey" FOREIGN KEY ("subsite_id") REFERENCES "subsite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_subsite_id_fkey" FOREIGN KEY ("subsite_id") REFERENCES "subsite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_occurrence" ADD CONSTRAINT "event_occurrence_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_occurrence" ADD CONSTRAINT "event_occurrence_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_subsite_id_fkey" FOREIGN KEY ("subsite_id") REFERENCES "subsite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_step" ADD CONSTRAINT "registration_step_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_subsite_id_fkey" FOREIGN KEY ("subsite_id") REFERENCES "subsite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
