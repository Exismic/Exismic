create table if not exists public.payment_transactions (
  id text primary key,
  provider text not null default 'razorpay',
  provider_payment_id text not null unique,
  provider_order_id text,
  user_id text not null,
  kind text not null,
  amount integer not null,
  currency text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payment_transactions_user_id_idx
  on public.payment_transactions (user_id);
