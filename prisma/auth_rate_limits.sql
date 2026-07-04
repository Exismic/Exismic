create table if not exists public.auth_rate_limits (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  type text not null,
  last_requested_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint auth_rate_limits_email_type_key unique (email, type)
);

create index if not exists auth_rate_limits_email_idx
  on public.auth_rate_limits (email);

create index if not exists auth_rate_limits_updated_at_idx
  on public.auth_rate_limits (updated_at desc);
