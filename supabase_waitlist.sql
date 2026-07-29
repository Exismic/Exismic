-- Supabase SQL Migration for Waitlist / Journal Newsletter Subscriptions
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'journal',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous and authenticated users to insert emails
DROP POLICY IF EXISTS "Allow public waitlist inserts" ON public.waitlist;
CREATE POLICY "Allow public waitlist inserts" ON public.waitlist 
    FOR INSERT WITH CHECK (true);

-- Allow public to select waitlist records (for checking existing email)
DROP POLICY IF EXISTS "Allow public waitlist select" ON public.waitlist;
CREATE POLICY "Allow public waitlist select" ON public.waitlist 
    FOR SELECT USING (true);
