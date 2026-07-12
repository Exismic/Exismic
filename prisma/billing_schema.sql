CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  plan_id text NOT NULL,
  market text NOT NULL,
  currency text NOT NULL,
  amount integer NOT NULL,
  gateway text NOT NULL,
  provider_order_id text,
  provider_payment_id text,
  status text NOT NULL DEFAULT 'created',
  credits integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL,
  provider_order_id text,
  provider_payment_id text,
  raw_payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(gateway, provider_event_id)
);

CREATE TABLE IF NOT EXISTS user_billing (
  user_id text PRIMARY KEY,
  plan_id text DEFAULT 'free',
  credits integer DEFAULT 0,
  status text DEFAULT 'free',
  current_period_end timestamptz,
  last_payment_order_id uuid,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_orders_user_created_idx ON payment_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_orders_gateway_order_idx ON payment_orders(gateway, provider_order_id);
CREATE INDEX IF NOT EXISTS payment_orders_payment_idx ON payment_orders(provider_payment_id);
CREATE INDEX IF NOT EXISTS payment_events_gateway_order_idx ON payment_events(gateway, provider_order_id);
CREATE INDEX IF NOT EXISTS payment_events_gateway_payment_idx ON payment_events(gateway, provider_payment_id);
