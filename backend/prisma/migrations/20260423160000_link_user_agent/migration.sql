-- Add app-auth link from `agent` -> `users`
ALTER TABLE "agent" ADD COLUMN IF NOT EXISTS "app_user_id" TEXT;

-- Ensure 1:1 between app user and profile agent (nullable for legacy/non-app agents)
CREATE UNIQUE INDEX IF NOT EXISTS "agent_app_user_id_key" ON "agent"("app_user_id");

-- FK to app-auth users
ALTER TABLE "agent"
ADD CONSTRAINT "agent_app_user_id_fkey"
FOREIGN KEY ("app_user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

