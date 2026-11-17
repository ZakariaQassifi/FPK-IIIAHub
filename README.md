# FPK IIIA Hub

![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python_3-009688?logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%2B_Storage-3FCF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/Status-Active-brightgreen)

**FPK IIIA Hub** is an open-access academic resource platform built for
**Computer Engineering & Artificial Intelligence (Licence IIIA)** students at the
**Faculté Polydisciplinaire de Khouribga (FPK), Université Sultan Moulay Slimane (USMS)**.

## Purpose

Students of the IIIA program juggle scattered Drive links, WhatsApp groups, and
forgotten archives to find their course materials. FPK IIIA Hub centralizes
everything in one structured, reliable place:

- **Structured semester libraries** — Licence (S1–S6) and Master (MS1–MS4)
  semesters, each organized by module
- **Full resource coverage** — Cours, TD/TP, past exams & corrections,
  summaries ("Others"), slides
- **Schedules** — official timetables (Emplois du temps) per semester and
  academic year
- **Announcements** — pinned, expiring notices from the administration
- **Peer-to-peer contributions** — students upload resources that go through an
  admin moderation queue before publication, keeping quality and accuracy high

The mission is simple: *no IIIA student should ever have to hunt for a course
PDF again.*

## Key Features

- 📚 **Hierarchical Semester/Module Library** — `Semester → Module → Resources`,
  grouped into Cours, TD & TP, and Examens sections
- 📄 **In-App PDF Preview & Direct Download** — resources open in a built-in
  viewer and download via short-lived signed URLs
- 📤 **Dedicated Contribution Portal** — students submit PDFs (25 MB max) with
  module/category metadata, then track their submission status
- 🕒 **Admin Moderation Queue (Files d'attente)** — every student submission is
  reviewed, approved, or rejected before it goes live
- 📊 **Dynamic Admin Dashboard** — manage modules, resources, timetables, and
  announcements; live stats at a glance

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 19 + Vite, TypeScript, Tailwind CSS, React Router, Supabase JS |
| **Backend** | FastAPI (Python), Uvicorn |
| **Database & Storage** | Supabase — PostgreSQL (RLS enabled) + Storage buckets |
| **Deployment** | Vercel — SPA frontend + FastAPI serverless functions, single unified URL |

The project is a monorepo:

```
FPKHUB/
├── frontend/          # Vite + React + TypeScript + Tailwind (SPA)
├── backend/           # FastAPI service (app/, migrations/)
├── api/index.py       # Vercel serverless entrypoint for the FastAPI app
├── requirements.txt   # Root requirements detected by Vercel's Python runtime
└── vercel.json        # Routing: /api/* → FastAPI, everything else → SPA
```

## Author & Credits

**Zakaria Qassifi (Zexter)** — Creator & Lead Developer
Computer Engineering & AI (IIIA) student at FPK, USMS ·
Vice-President of the **Al-Khawarizmi IT & Robotics Club**

---

<div align="center">

**Built & Maintained by Zakaria Qassifi (Zexter Team)**

FPK IIIA Hub · Faculté Polydisciplinaire de Khouribga · Université Sultan Moulay Slimane

</div>
