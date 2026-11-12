begin;

do $$
begin
  create type public.role_name as enum ('VISITOR', 'STUDENT', 'PROFESSOR', 'ADMIN');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.resource_category as enum (
    'COURS',
    'TD',
    'TP',
    'SLIDES',
    'EXAMS',
    'CORRECTIONS',
    'RESUMES'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.resource_status as enum ('APPROVED', 'PENDING', 'REJECTED');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name public.role_name not null unique,
  created_at timestamptz not null default now()
);

insert into public.roles (name)
values ('VISITOR'), ('STUDENT'), ('PROFESSOR'), ('ADMIN')
on conflict (name) do nothing;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  avatar_url text,
  role_id uuid not null references public.roles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academic_fields (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

insert into public.academic_fields (name, slug)
values
  ('Informatique', 'informatique'),
  ('Mathématiques et Informatique', 'mathematiques-et-informatique')
on conflict (slug) do nothing;

create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  academic_field_id uuid not null references public.academic_fields (id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (academic_field_id, name),
  unique (academic_field_id, slug)
);

insert into public.semesters (academic_field_id, name, slug)
select af.id, semester.name, semester.slug
from public.academic_fields af
cross join (
  values
    ('S1', 's1'),
    ('S2', 's2'),
    ('S3', 's3'),
    ('S4', 's4'),
    ('S5', 's5'),
    ('S6', 's6'),
    ('M1', 'm1'),
    ('M2', 'm2')
) as semester (name, slug)
on conflict (academic_field_id, slug) do nothing;

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.semesters (id) on delete cascade,
  title text not null,
  code text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (semester_id, code)
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  category public.resource_category not null,
  file_url text not null,
  file_size bigint check (file_size is null or file_size >= 0),
  academic_year text not null,
  professor_name text,
  uploader_id uuid references public.users (id) on delete set null,
  status public.resource_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timetables (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.semesters (id) on delete cascade,
  file_url text not null,
  academic_year text not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (semester_id, academic_year)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null default 'GENERAL',
  author_id uuid references public.users (id) on delete set null,
  is_pinned boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists users_role_id_idx on public.users (role_id);
create index if not exists semesters_academic_field_id_idx on public.semesters (academic_field_id);
create index if not exists modules_semester_id_idx on public.modules (semester_id);
create index if not exists resources_module_id_idx on public.resources (module_id);
create index if not exists resources_uploader_id_idx on public.resources (uploader_id);
create index if not exists resources_status_idx on public.resources (status);
create index if not exists timetables_semester_id_idx on public.timetables (semester_id);
create index if not exists announcements_author_id_idx on public.announcements (author_id);
create index if not exists announcements_created_at_idx on public.announcements (created_at desc);
create index if not exists announcements_expires_at_idx on public.announcements (expires_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
before update on public.resources
for each row execute function public.set_updated_at();

drop trigger if exists set_timetables_updated_at on public.timetables;
create trigger set_timetables_updated_at
before update on public.timetables
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  student_role_id uuid;
begin
  select id into student_role_id
  from public.roles
  where name = 'STUDENT';

  if student_role_id is null then
    insert into public.roles (name)
    values ('STUDENT')
    on conflict (name) do nothing
    returning id into student_role_id;

    if student_role_id is null then
      select id into student_role_id
      from public.roles
      where name = 'STUDENT';
    end if;
  end if;

  insert into public.users (id, full_name, email, avatar_url, role_id)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    coalesce(new.email, new.id::text || '@no-email.local'),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    ),
    student_role_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    join public.roles r on r.id = u.role_id
    where u.id = auth.uid()
      and r.name = 'ADMIN'
  );
$$;

alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.academic_fields enable row level security;
alter table public.semesters enable row level security;
alter table public.modules enable row level security;
alter table public.resources enable row level security;
alter table public.timetables enable row level security;
alter table public.announcements enable row level security;

drop policy if exists "Roles are readable by everyone" on public.roles;
create policy "Roles are readable by everyone"
on public.roles for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage roles" on public.roles;
create policy "Admins manage roles"
on public.roles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
on public.users for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage users" on public.users;
create policy "Admins manage users"
on public.users for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Academic fields are readable by everyone" on public.academic_fields;
create policy "Academic fields are readable by everyone"
on public.academic_fields for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage academic fields" on public.academic_fields;
create policy "Admins manage academic fields"
on public.academic_fields for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Semesters are readable by everyone" on public.semesters;
create policy "Semesters are readable by everyone"
on public.semesters for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage semesters" on public.semesters;
create policy "Admins manage semesters"
on public.semesters for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Modules are readable by everyone" on public.modules;
create policy "Modules are readable by everyone"
on public.modules for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage modules" on public.modules;
create policy "Admins manage modules"
on public.modules for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Approved resources are readable by everyone" on public.resources;
create policy "Approved resources are readable by everyone"
on public.resources for select
to anon, authenticated
using (status = 'APPROVED' or uploader_id = auth.uid() or public.is_admin());

drop policy if exists "Authenticated users can submit resources" on public.resources;
create policy "Authenticated users can submit resources"
on public.resources for insert
to authenticated
with check (uploader_id = auth.uid() and status = 'PENDING');

drop policy if exists "Uploaders can update pending resources" on public.resources;
create policy "Uploaders can update pending resources"
on public.resources for update
to authenticated
using (uploader_id = auth.uid() and status = 'PENDING')
with check (uploader_id = auth.uid() and status = 'PENDING');

drop policy if exists "Admins manage resources" on public.resources;
create policy "Admins manage resources"
on public.resources for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Timetables are readable by everyone" on public.timetables;
create policy "Timetables are readable by everyone"
on public.timetables for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage timetables" on public.timetables;
create policy "Admins manage timetables"
on public.timetables for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Active announcements are readable by everyone" on public.announcements;
create policy "Active announcements are readable by everyone"
on public.announcements for select
to anon, authenticated
using (expires_at is null or expires_at > now());

drop policy if exists "Admins manage announcements" on public.announcements;
create policy "Admins manage announcements"
on public.announcements for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

commit;
