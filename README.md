# Papertrail

Fire compliance tracking for UK fire & security servicing companies. Phase 1
of the build brief: buildings, certificates, assets, fire risk assessments +
actions, defects, and a cross-building schedule view.

Stack: Next.js (App Router) + Supabase (Postgres, Auth, RLS) + Tailwind v4,
deployed to Vercel.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier is fine).
2. In the Supabase dashboard, go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
3. Go to the **SQL Editor**, paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql),
   and run it. This creates all tables, row-level security policies (so each
   organisation only ever sees its own data), and a trigger that creates an
   Organisation + Profile automatically when someone signs up.
4. By default Supabase requires email confirmation for new users. For local
   testing you can turn this off under **Authentication → Providers → Email
   → Confirm email**, or just click the confirmation link Supabase emails you.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the two values from
step 1:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the
sign-up page. Creating an account creates one Organisation for you (Phase 1:
one organisation per signed-up user; multi-user orgs come later).

## What's here (Phase 1)

- **Auth** — Supabase email/password sign up & log in, session handled via
  `src/proxy.ts` (Next.js 16's replacement for `middleware.ts`).
- **Buildings** — full CRUD at `/buildings`.
- **Certificates, Assets, Risk Assessments (+ Actions), Defects** — full CRUD,
  scoped to a building, on each building's detail page.
- **Schedule** — `/schedule`, every certificate expiry and FRA review date
  across all buildings, soonest/most-overdue first.
- **Status logic** — `src/lib/status.ts`, ported exactly per the brief:
  - `ok` (>30 days out) / `warning` (≤30 days) / `expired` (past) / `missing` (no date)
  - a building's overall status is the worst of its certificates and its
    current (most recently conducted) fire risk assessment
  - any open **high-priority** action or open **critical** defect forces the
    building to `expired` regardless of dates
  - no risk assessment on file at all is also forced to `expired`
- **Design** — Fraunces (serif) / Public Sans / JetBrains Mono via
  `next/font`, a botanical green palette, stamp-style status badges, and a
  radial "days remaining" dial (`src/components/StatusBadge.tsx`,
  `src/components/RadialDial.tsx`).

## Deploying

Push this to a GitHub repo and import it into [Vercel](https://vercel.com) —
it auto-detects Next.js. Add the same two `NEXT_PUBLIC_SUPABASE_*` env vars
in the Vercel project settings.

## Not built yet (see build brief for phasing)

- Client portal (read-only login/share link scoped to one building) — Phase 2
- Scheduled reminder emails via Resend — Phase 3
- Stripe billing, certificate PDF uploads, AI expiry-date extraction — Phase 4
