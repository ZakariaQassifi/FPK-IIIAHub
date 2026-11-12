# FPK Academic Hub

Academic resource platform for the Faculty of Sciences (FPK). Phase 1 sets up the
frontend, backend, and Supabase database schema.

## Stack

- **Frontend:** Vite, React, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, Uvicorn
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage)

## Project structure

```
FPKHUB/
├── frontend/                   # Vite + React + TS + Tailwind
│   ├── src/
│   │   ├── lib/supabase.ts     # Supabase browser client
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── .env.example
├── backend/                    # FastAPI service
│   ├── app/
│   │   ├── config.py           # Settings loaded from .env
│   │   ├── database.py         # Supabase client
│   │   └── main.py             # FastAPI app + CORS
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_contribution_system.sql
│   │   └── 003_iiia_hierarchy.sql
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## Prerequisites

- Node.js 20+ and npm
- Python 3.11+
- A Supabase project ([supabase.com](https://supabase.com))

## 1. Supabase setup

1. Create a new project at [database.new](https://database.new).
2. Open **SQL Editor**, paste the contents of
   `backend/migrations/001_initial_schema.sql`, and run it.
3. Repeat for `002_contribution_system.sql` and `003_iiia_hierarchy.sql`
   (the latter seeds the IIIA academic field, its S1–S6 / MS1–MS4 semesters
   and the module catalogue).
4. Copy the project URL and keys from **Project Settings → API**:
   - `Project URL`
   - `anon public` key
   - `service_role` key (backend only, never expose to the browser)
5. Enable Google sign-in under **Authentication → Providers → Google**. Add your
   Google OAuth client ID/secret and set the Supabase callback URL shown there as
   an authorized redirect URI in Google Cloud Console.
6. Under **Authentication → URL Configuration**, set the site URL to
   `http://localhost:5173` and add it as a redirect URL.

The migration creates all tables, enums, indexes, RLS policies, and seeds the
roles and academic fields. A trigger on `auth.users` creates the matching
`public.users` row with the `STUDENT` role on every signup, including Google OAuth.

To apply migrations with the Supabase CLI instead of the SQL editor:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## 2. Frontend

```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Runs at `http://localhost:5173`.

Other commands:

```bash
npm run build     # Type-check and production build
npm run lint      # Lint with oxlint
npm run preview   # Preview the production build
```

## 3. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in the Supabase credentials
uvicorn app.main:app --reload
```

Runs at `http://localhost:8000`.

- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
- Ping: `http://localhost:8000/api/v1/ping`

CORS is configured from `FRONTEND_ORIGINS` in `backend/.env` (comma-separated).

## Environment variables

### frontend/.env

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `VITE_API_URL` | Backend base URL (`http://localhost:8000`) |

### backend/.env

| Variable | Description |
| --- | --- |
| `APP_NAME` | API display name |
| `ENVIRONMENT` | `development` / `production` |
| `FRONTEND_ORIGINS` | Comma-separated allowed origins |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |

## Database model

| Table | Purpose |
| --- | --- |
| `roles` | `VISITOR`, `STUDENT`, `PROFESSOR`, `ADMIN` |
| `users` | Profile linked to `auth.users` |
| `academic_fields` | `Informatique`, `Mathématiques et Informatique` |
| `semesters` | `S1`–`S6`, `M1`, `M2` per academic field |
| `modules` | Modules inside a semester |
| `resources` | `COURS`, `TD`, `TP`, `SLIDES`, `EXAMS`, `CORRECTIONS`, `RESUMES` with approval status |
| `timetables` | Timetable file per semester and academic year |
| `announcements` | Pinned or expiring announcements |

Row Level Security is enabled. Catalog data is publicly readable, resources are
public only when `APPROVED`, and admin-only management is gated by the
`public.is_admin()` helper.

## Notes

- Never commit `.env` files or expose the Supabase service role key in the
  frontend.
- Resource files should be uploaded to Supabase Storage; `resources.file_url`
  stores the resulting public or signed URL.
- `backend/app/database.py` exposes an anon-key client. Use per-request,
  user-scoped clients for authenticated queries and keep the service role key on
  the server only.


## Academic hierarchy (IIIA)

```
IIIA field → semesters (S1–S6, MS1–MS4) → modules → resources
```

Student flow: `Home → Library → Semester → Module → resources` grouped into
three sections — **Cours**, **TD & TP**, **Examens** — each PDF downloadable
through a short-lived signed URL.

### API surface

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/iiia/semesters` | IIIA semesters with module/resource counts |
| `GET` | `/api/v1/iiia/semesters/{slug}/modules` | Modules of a semester |
| `GET` | `/api/v1/modules/{id}/resources` | Approved resources of a module |
| `GET` | `/api/v1/resources/{id}/download` | Signed download URL |
| `POST` | `/api/v1/admin/login` | Admin login (username + password) |
| `GET` | `/api/v1/admin/me` | Current admin (JWT) |
| `GET` | `/api/v1/admin/modules` | List modules |
| `POST` | `/api/v1/admin/modules` | Create a module |
| `GET` | `/api/v1/admin/resources` | List all resources |
| `POST` | `/api/v1/admin/resources/upload` | Upload a resource (auto-approved) |
| `PATCH` | `/api/v1/admin/resources/{id}` | Edit resource metadata |
| `DELETE` | `/api/v1/admin/resources/{id}` | Delete a resource + its file |
| `GET` | `/api/v1/admin/timetables` | List timetables |
| `POST` | `/api/v1/admin/timetables` | Publish a timetable |
| `DELETE` | `/api/v1/admin/timetables/{id}` | Delete a timetable + its file |
| `GET` | `/api/v1/admin/pending-resources` | Moderation queue |
| `PATCH` | `/api/v1/admin/resources/{id}/approve` | Publish a submission |
| `PATCH` | `/api/v1/admin/resources/{id}/reject` | Reject a submission |
| `GET` `POST` `PATCH` `DELETE` | `/api/v1/admin/announcements` | Announcement CRUD |

All `/api/v1/admin/*` routes require a bearer token: either the JWT issued by
`/api/v1/admin/login` or a Supabase access token whose user holds the `ADMIN`
role.
