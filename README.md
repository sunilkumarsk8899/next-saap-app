# Next.js + Supabase + Pexels Starter

Production-ready Next.js 14 App Router project with TypeScript strict mode, Tailwind CSS, Supabase Auth + Postgres favorites, and a secure Pexels proxy.

## Features

- Next.js 14 App Router only (`app/`), TypeScript strict mode
- Tailwind CSS styling
- Supabase Auth (email/password sign up, sign in, sign out)
- Protected `/account` route through `middleware.ts`
- Postgres `favorites` table with RLS policies
- Secure server-only Pexels proxy at `app/api/pexels/route.ts`
- Proxy supports:
  - `GET /api/pexels/search?q=...&per_page=...&page=...`
  - `GET /api/pexels/curated?per_page=...&page=...`
  - validation + max `per_page=30`
  - simple in-memory per-IP rate limiting
  - cache headers for Vercel CDN (`s-maxage`, `stale-while-revalidate`)

## 1) Supabase setup

1. Create a Supabase project.
2. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. In Supabase SQL editor, run `sql/supabase.sql`.
4. In **Authentication → Providers**, ensure email/password auth is enabled.

## 2) Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `PEXELS_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` is included for completeness, but not required by this app.

> Keep `PEXELS_API_KEY` server-only. Do **not** expose it to client code.

## 3) Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 4) Deploy to Vercel

1. Push repo to GitHub.
2. Import project in Vercel.
3. Set environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `PEXELS_API_KEY`
   - optional `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy.

## Notes on rate limiting

The Pexels route uses an in-memory map keyed by IP. This is fine for local/dev and basic protection, but serverless instances do not share memory and can cold start. For production-grade limits on Vercel, use a centralized store (e.g. Upstash Redis).
