-- 002_contribution_system.sql
-- Adds the PENDING_REVIEW status for student submissions, updates the RLS
-- policies accordingly, and creates the private storage bucket for uploads.
--
-- Note: ALTER TYPE ... ADD VALUE cannot run inside a transaction block; run
-- this file as standalone statements (Supabase SQL Editor or CLI db push).

alter type public.resource_status add value if not exists 'PENDING_REVIEW' after 'PENDING';

drop policy if exists "Authenticated users can submit resources" on public.resources;
create policy "Authenticated users can submit resources"
on public.resources for insert
to authenticated
with check (uploader_id = auth.uid() and status in ('PENDING', 'PENDING_REVIEW'));

drop policy if exists "Uploaders can update pending resources" on public.resources;
create policy "Uploaders can update pending resources"
on public.resources for update
to authenticated
using (uploader_id = auth.uid() and status in ('PENDING', 'PENDING_REVIEW'))
with check (uploader_id = auth.uid() and status in ('PENDING', 'PENDING_REVIEW'));

create index if not exists resources_uploader_created_idx
on public.resources (uploader_id, created_at desc);

insert into storage.buckets (id, name, public)
values ('academic-resources', 'academic-resources', false)
on conflict (id) do nothing;
