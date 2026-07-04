create table if not exists public.trusted_login_devices (
  id text primary key,
  user_id text not null unique references public."User"(id) on delete cascade,
  login_email text not null unique,
  device_token_hash text not null unique,
  device_name text not null,
  device_type text not null default 'phone',
  platform text,
  browser_name text,
  os_version text,
  device_model text,
  notification_permission text,
  status text not null default 'active',
  last_ip text,
  user_agent text,
  setup_completed_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trusted_login_devices_user_status_expires_idx
  on public.trusted_login_devices(user_id, status, expires_at);
