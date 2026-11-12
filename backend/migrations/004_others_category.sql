-- 004_others_category.sql
-- Adds the "OTHERS" resource category, used for résumés, cheat sheets,
-- summaries and any other miscellaneous but useful study document.
--
-- The IIIA library exposes four student facing sections:
--   COURS | TD & TP (TD + TP) | EXAMS (EXAMS + CORRECTIONS) | OTHERS
-- where the "Others" section also gathers the legacy SLIDES and RESUMES values.

-- Note: ALTER TYPE ... ADD VALUE cannot run inside a transaction block; run
-- this file as standalone statements (Supabase SQL Editor or CLI db push).

alter type public.resource_category add value if not exists 'OTHERS';

-- The new value has no ordering requirement, so nothing else to migrate.
-- Legacy SLIDES / RESUMES rows keep their value and are displayed inside
-- the "Others" section by the application layer.
