do $$
declare
  required_table text;
  required_tables text[] := array[
    'support_agents',
    'support_documents',
    'support_conversations',
    'support_messages',
    'support_leads',
    'support_usage_logs'
  ];
begin
  foreach required_table in array required_tables loop
    if not exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
      and table_name = required_table
    ) then
      raise exception 'Missing Support Agent table: %', required_table;
    end if;
  end loop;
end $$;

do $$
declare
  test_user uuid := gen_random_uuid();
  test_agent uuid;
  test_document uuid;
  test_conversation uuid;
  test_lead uuid;
begin
  insert into public.support_agents (
    user_id,
    name,
    business_name,
    website_url,
    description,
    tone,
    welcome_message,
    fallback_message,
    primary_color,
    widget_position,
    theme,
    lead_capture_enabled
  ) values (
    test_user,
    'Verification Agent',
    'Verification Business',
    'https://example.com',
    'Schema verification row',
    'professional',
    'Welcome',
    'Please contact the team.',
    '#8B5CF6',
    'bottom-right',
    'midnight',
    true
  ) returning id into test_agent;

  insert into public.support_documents (
    agent_id,
    user_id,
    title,
    source_type,
    content
  ) values (
    test_agent,
    test_user,
    'Verification Knowledge',
    'note',
    'This row verifies support document writes.'
  ) returning id into test_document;

  insert into public.support_leads (
    agent_id,
    name,
    email,
    message
  ) values (
    test_agent,
    'Test Lead',
    'lead@example.com',
    'Verification lead'
  ) returning id into test_lead;

  insert into public.support_conversations (
    agent_id,
    visitor_id,
    lead_id,
    status
  ) values (
    test_agent,
    'verification-visitor',
    test_lead,
    'open'
  ) returning id into test_conversation;

  insert into public.support_messages (
    conversation_id,
    agent_id,
    role,
    content
  ) values
    (test_conversation, test_agent, 'visitor', 'Question'),
    (test_conversation, test_agent, 'assistant', 'Answer');

  insert into public.support_usage_logs (
    agent_id,
    user_id,
    event_type,
    units
  ) values (
    test_agent,
    test_user,
    'message',
    1
  );

  delete from public.support_agents where id = test_agent;
end $$;
