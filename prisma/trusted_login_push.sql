ALTER TABLE "trusted_login_devices"
  ADD COLUMN IF NOT EXISTS "push_endpoint" TEXT,
  ADD COLUMN IF NOT EXISTS "push_p256dh" TEXT,
  ADD COLUMN IF NOT EXISTS "push_auth" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "trusted_login_devices_push_endpoint_key"
  ON "trusted_login_devices"("push_endpoint");

CREATE TABLE IF NOT EXISTS "trusted_login_challenges" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "device_id" TEXT NOT NULL,
  "login_email" TEXT NOT NULL,
  "browser_token_hash" TEXT NOT NULL,
  "approval_token_hash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "request_ip" TEXT,
  "request_device" TEXT,
  "request_user_agent" TEXT,
  "return_url" TEXT NOT NULL DEFAULT '/dashboard',
  "expires_at" TIMESTAMP(3) NOT NULL,
  "responded_at" TIMESTAMP(3),
  "consumed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "trusted_login_challenges_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "trusted_login_challenges_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "trusted_login_challenges_device_id_fkey"
    FOREIGN KEY ("device_id") REFERENCES "trusted_login_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "trusted_login_challenges_login_email_status_expires_at_idx"
  ON "trusted_login_challenges"("login_email", "status", "expires_at");

CREATE INDEX IF NOT EXISTS "trusted_login_challenges_device_id_status_idx"
  ON "trusted_login_challenges"("device_id", "status");
