-- THE SYSTEM — database schema
--
-- Run this once, in full, in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste this whole file -> Run).
-- It is idempotent-ish (uses IF NOT EXISTS / OR REPLACE / drop-then-create
-- for policies) so re-running it after a partial failure is safe.
--
-- Everything here is USER-OWNED data only. Companies, skills, subskills,
-- todos, and the 5 app-owned resumes are static application data compiled
-- into the frontend (src/data/*.js) — they do NOT live in this database.

-- ============================================================================
-- 1. profiles — one row per authenticated user
-- ============================================================================

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text not null default 'Hunter',
  -- Marks the single app-owner account (the only one allowed to see the 5
  -- app-owned resume PDFs). Deliberately NOT an email hardcoded in client
  -- code — that would ship your real email address in the public JS bundle
  -- for no security benefit (the actual enforcement is the RLS policies
  -- below, which check this column server-side; nobody can grant themselves
  -- access by reading a string out of DevTools). Flip it via the SQL Editor
  -- after creating your account — see the instructions at the bottom of
  -- this file. The WITH CHECK on the update policy below makes it so a
  -- normal client-side update (e.g. editing your display name) can never
  -- change this column — only a direct SQL Editor command can.
  is_owner   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_owner = (select p.is_owner from public.profiles p where p.id = auth.uid())
  );

-- Auto-create a profile row the moment someone signs up. This runs as the
-- table owner (security definer), bypassing RLS for this one insert only —
-- the standard, recommended Supabase pattern for this exact problem, since
-- the client has no row to update via RLS until this trigger creates one.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', 'Hunter'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 2. user_skill_todos — completion of a static skill/subskill todo
--    todo_id matches a static id from src/data/skills.js, e.g. "dsa.core-structures.0"
-- ============================================================================

create table if not exists public.user_skill_todos (
  user_id      uuid not null references auth.users(id) on delete cascade,
  todo_id      text not null,
  completed    boolean not null default true,
  completed_at timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (user_id, todo_id)
);

alter table public.user_skill_todos enable row level security;

drop policy if exists "user_skill_todos_all_own" on public.user_skill_todos;
create policy "user_skill_todos_all_own" on public.user_skill_todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 3. user_company_prep — completion of a company's static prep-checklist item
--    todo_id = "{companyId}:{prepTipIndex}" (see src/data/companies.js prepTips)
-- ============================================================================

create table if not exists public.user_company_prep (
  user_id    uuid not null references auth.users(id) on delete cascade,
  company_id text not null,
  todo_id    text not null,
  completed  boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, company_id, todo_id)
);

alter table public.user_company_prep enable row level security;

drop policy if exists "user_company_prep_all_own" on public.user_company_prep;
create policy "user_company_prep_all_own" on public.user_company_prep
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 4. missions — the personal job-application tracker (Mission Board)
--    Mirrors the existing client-side Mission shape from src/data/seed.js
-- ============================================================================

create table if not exists public.missions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  company    text not null,
  role       text not null,
  type       text not null,
  difficulty text not null,
  status     text not null default 'Queued',
  deadline   date,
  notes      text,
  xp_awarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.missions enable row level security;

drop policy if exists "missions_all_own" on public.missions;
create policy "missions_all_own" on public.missions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 5. user_resumes — metadata pointing at a private Storage object
--    One active resume per user for v1 (unique on user_id).
-- ============================================================================

create table if not exists public.user_resumes (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references auth.users(id) on delete cascade,
  storage_path      text not null,
  original_filename text not null,
  mime_type         text not null,
  file_size         int not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.user_resumes enable row level security;

drop policy if exists "user_resumes_all_own" on public.user_resumes;
create policy "user_resumes_all_own" on public.user_resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 5b. user_raid_resumes — Resume Raid: MANY resumes per user (no unique
--     constraint, unlike user_resumes above which is the single "My Resume"
--     slot). Objects live in the same private "resumes" bucket under
--     {user_id}/raid/{id}.pdf — no new bucket or storage policy needed,
--     since the existing "resumes" bucket policy already scopes access to
--     anything under the caller's own {user_id}/ folder, regardless of what
--     comes after it.
-- ============================================================================

create table if not exists public.user_raid_resumes (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  storage_path      text not null,
  original_filename text not null,
  mime_type         text not null,
  file_size         int not null,
  created_at        timestamptz not null default now()
);

alter table public.user_raid_resumes enable row level security;

drop policy if exists "user_raid_resumes_all_own" on public.user_raid_resumes;
create policy "user_raid_resumes_all_own" on public.user_raid_resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 6. Storage — private "resumes" bucket, one folder per user
--    Objects must be uploaded at path: {user_id}/resume.pdf
--    (Resume Raid additionally uses {user_id}/raid/{id}.pdf in this same bucket.)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

drop policy if exists "resumes_select_own" on storage.objects;
create policy "resumes_select_own" on storage.objects
  for select using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "resumes_insert_own" on storage.objects;
create policy "resumes_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "resumes_update_own" on storage.objects;
create policy "resumes_update_own" on storage.objects
  for update using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "resumes_delete_own" on storage.objects;
create policy "resumes_delete_own" on storage.objects
  for delete using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- 7. Storage — private "app-resumes" bucket, OWNER-ONLY
--    Holds the 5 app-owned resume PDFs (SDE.pdf, Backend.pdf, ML.pdf, etc.)
--    used by the Resume Maxing feature. These are Mayank's personal resumes,
--    not shared application content — no other authenticated user should be
--    able to read them. Upload the 5 files via the Supabase Dashboard's
--    Storage UI (drag-and-drop) — that path uses the dashboard's own
--    privileged access and bypasses these RLS policies entirely, so no
--    client-side INSERT policy is needed or granted here. Only a read path
--    is opened, and only to whoever has profiles.is_owner = true — checked
--    server-side, nothing about "who owns this" lives in client code.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('app-resumes', 'app-resumes', false)
on conflict (id) do nothing;

drop policy if exists "app_resumes_select_owner_only" on storage.objects;
create policy "app_resumes_select_owner_only" on storage.objects
  for select using (
    bucket_id = 'app-resumes'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_owner = true)
  );

-- ============================================================================
-- Done. Sanity check: every table below should show rowsecurity = true.
-- ============================================================================
-- select tablename, rowsecurity from pg_tables
--   where schemaname = 'public'
--   and tablename in ('profiles','user_skill_todos','user_company_prep','missions','user_resumes');

-- ============================================================================
-- ONE-TIME MANUAL STEP — run this yourself, separately, after signing up
-- with whichever account should be the app owner. Not part of the block
-- above on purpose: this is a privileged action, not routine setup, and the
-- SQL Editor's connection has enough privilege to bypass the WITH CHECK
-- above that blocks this exact update from the client app itself.
-- ============================================================================
-- update public.profiles set is_owner = true where email = 'your-official-email@example.com';
