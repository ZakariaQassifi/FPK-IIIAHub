-- 005_pending_contributions.sql
-- Creates the moderation queue table used by the student contribution
-- portal. A contribution is uploaded to Storage immediately but stays in
-- this table until an administrator approves it, at which point a row is
-- created in public.resources (the live library).
--
-- Idempotent: safe to re-run.

begin;

create table if not exists public.pending_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category public.resource_category not null default 'OTHERS',
  file_url text not null,
  file_size bigint check (file_size is null or file_size >= 0),
  file_type text,
  contributor_name text,
  contributor_email text,
  semester_id uuid references public.semesters (id) on delete cascade,
  module_id uuid references public.modules (id) on delete cascade,
  academic_year text not null default '2025/2026',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users (id) on delete set null
);

create index if not exists pending_resources_created_idx
  on public.pending_resources (created_at desc);

create index if not exists pending_resources_status_idx
  on public.pending_resources (created_at desc);

create index if not exists pending_resources_module_idx
  on public.pending_resources (module_id);

alter table public.pending_resources enable row level security;

-- The moderation queue is private: only the service role (used by the
-- FastAPI backend) may read it.
drop policy if exists "Anyone can submit a contribution" on public.pending_resources;
create policy "Anyone can submit a contribution"
  on public.pending_resources for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins manage pending contributions" on public.pending_resources;
create policy "Admins manage pending contributions"
  on public.pending_resources for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

commit;
