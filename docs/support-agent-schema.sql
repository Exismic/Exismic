create table if not exists public.support_agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  business_name text not null,
  website_url text,
  description text,
  tone text not null default 'friendly',
  welcome_message text not null,
  fallback_message text not null,
  primary_color text not null default '#8B5CF6',
  widget_position text not null default 'bottom-right',
  widget_icon_url text,
  theme text not null default 'midnight',
  lead_capture_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_agents
  add column if not exists widget_icon_url text;

create table if not exists public.support_documents (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.support_agents(id) on delete cascade,
  user_id uuid not null,
  title text not null,
  source_type text not null default 'document',
  source_url text,
  content text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.support_agents(id) on delete cascade,
  visitor_id text,
  lead_id uuid,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  agent_id uuid not null references public.support_agents(id) on delete cascade,
  role text not null,
  content text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.support_leads (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.support_agents(id) on delete cascade,
  name text,
  email text,
  phone text,
  message text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.support_usage_logs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.support_agents(id) on delete cascade,
  user_id uuid not null,
  event_type text not null,
  units integer not null default 1,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.support_agents drop constraint if exists support_agents_user_id_fkey;
alter table public.support_documents drop constraint if exists support_documents_user_id_fkey;
alter table public.support_usage_logs drop constraint if exists support_usage_logs_user_id_fkey;

create index if not exists support_agents_user_id_idx on public.support_agents(user_id);
create index if not exists support_documents_agent_id_idx on public.support_documents(agent_id);
create index if not exists support_conversations_agent_id_idx on public.support_conversations(agent_id);
create index if not exists support_messages_conversation_id_idx on public.support_messages(conversation_id);
create index if not exists support_messages_agent_id_idx on public.support_messages(agent_id);
create index if not exists support_leads_agent_id_idx on public.support_leads(agent_id);
create index if not exists support_usage_logs_agent_user_idx on public.support_usage_logs(agent_id, user_id);

alter table public.support_agents enable row level security;
alter table public.support_documents enable row level security;
alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_leads enable row level security;
alter table public.support_usage_logs enable row level security;

drop policy if exists "Users manage own support agents" on public.support_agents;
create policy "Users manage own support agents" on public.support_agents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own support documents" on public.support_documents;
create policy "Users manage own support documents" on public.support_documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own support conversations" on public.support_conversations;
create policy "Users manage own support conversations" on public.support_conversations
  for all
  using (
    exists (
      select 1 from public.support_agents
      where support_agents.id = support_conversations.agent_id
      and support_agents.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.support_agents
      where support_agents.id = support_conversations.agent_id
      and support_agents.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own support messages" on public.support_messages;
create policy "Users manage own support messages" on public.support_messages
  for all
  using (
    exists (
      select 1 from public.support_agents
      where support_agents.id = support_messages.agent_id
      and support_agents.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.support_agents
      where support_agents.id = support_messages.agent_id
      and support_agents.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own support leads" on public.support_leads;
create policy "Users manage own support leads" on public.support_leads
  for all
  using (
    exists (
      select 1 from public.support_agents
      where support_agents.id = support_leads.agent_id
      and support_agents.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.support_agents
      where support_agents.id = support_leads.agent_id
      and support_agents.user_id = auth.uid()
    )
  );

drop policy if exists "Users read own usage logs" on public.support_usage_logs;
create policy "Users read own usage logs" on public.support_usage_logs
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own usage logs" on public.support_usage_logs;
create policy "Users insert own usage logs" on public.support_usage_logs
  for insert with check (auth.uid() = user_id);
