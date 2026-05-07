/**
 * SUPABASE STORAGE SETUP GUIDE
 * 
 * The "Bucket not found" error occurs because the 'avatars' storage bucket 
 * is missing in your Supabase project. 
 * 
 * FOLLOW THESE STEPS TO FIX:
 * 
 * 1. Go to your Supabase Dashboard (https://supabase.com/dashboard)
 * 2. Click on 'Storage' in the left sidebar.
 * 3. Click 'New Bucket'.
 * 4. Name the bucket: avatars
 * 5. IMPORTANT: Toggle 'Public bucket' to ON (so photos are viewable by everyone).
 * 6. Click 'Create bucket'.
 * 
 * POLICIES (Required for Uploads):
 * To allow users to upload their own photos, add these 'Bucket Policies':
 * 
 * - SELECT: Allow public access (All users).
 * - INSERT: Allow access if 'auth.uid() is not null' (Logged in users).
 * - UPDATE: Allow access if 'auth.uid() is not null' (Logged in users).
 */

// You can also run this SQL in your Supabase SQL Editor to automate the setup:
/*
-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- 2. Allow public access to read
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 3. Allow authenticated users to upload
create policy "Authenticated users can upload"
on storage.objects for insert
with check (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- 4. Allow users to update their own files
create policy "Users can update their own files"
on storage.objects for update
with check (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);
*/
