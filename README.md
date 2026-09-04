# MPUGLOBAL — MarketPlace Unlimited

Front end for MarketPlace Unlimited: a vetted business directory for the
Cameroonian market and its diaspora, organised into sixteen pillars.

Built from the Claude Design handoff (`MPUGLOBAL v2.dc.html`) and the product
brief (`MarketPlace Unlimited (MPUGLOBAL).docx`). Backed by Supabase — Postgres
for members and listings, Supabase Auth for sign-in, Supabase Storage for
listing images.

## Running it

```bash
npm install
cp .env.example .env.local   # then fill in the two Supabase values
npm run dev        # http://localhost:5173
npm run build      # production bundle → dist/
npm run lint       # tsc project-wide typecheck
```

## Connecting Supabase

One-time setup for a new project.

1. **Create the project** at [supabase.com](https://supabase.com). Any region;
   pick the one nearest your members.

2. **Run the migration.** Dashboard → SQL Editor → paste
   `supabase/migrations/0001_init.sql` → Run. It creates both tables, the row
   level security policies, the sign-up trigger, the counter functions and the
   `listing-media` storage bucket. Optionally run `supabase/seed.sql` too for
   demo listings to browse; skip it for a real launch.

   With the Supabase CLI instead: `supabase db push`.

3. **Turn off email confirmation.** Dashboard → Authentication → Providers →
   Email → disable *Confirm email*. Membership is gated by admin review, not by
   an inbox — leaving it on means every applicant must click a link before
   their application even reaches the queue.

4. **Copy the keys.** Dashboard → Project Settings → API. Put the Project URL
   and the `anon` **public** key into `.env.local`:

   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

   The `service_role` key must never go in this file — it bypasses every
   policy below. On Vercel, set the same two variables under Project Settings →
   Environment Variables and redeploy.

5. **Make the first admin.** Sign up through the app, then in the SQL editor:

   ```sql
   update public.profiles
      set role = 'admin', status = 'approved'
    where email = 'you@example.com';
   ```

   From then on admins are made the same way, or by an existing admin.

## Who can do what

Enforced by row level security in the database, not by the client — a request
for anything outside these lines comes back empty or is rejected outright.

| | Visitor | Pending | Approved member | Admin |
| --- | --- | --- | --- | --- |
| Browse and search published listings | ✓ | ✓ | ✓ | ✓ |
| See their own application | — | ✓ | ✓ | ✓ |
| See their own unpublished listings | — | — | ✓ | ✓ |
| Create and edit their own listings | — | — | ✓ | ✓ |
| Publish or verify a listing | — | — | — | ✓ |
| Approve or decline an applicant | — | — | — | ✓ |
| See every profile and every listing | — | — | — | ✓ |

Two database triggers cover what row policies cannot. RLS decides which *rows*
you may write; it cannot stop you rewriting a privileged *column* in a row you
own. Without them a member could `PATCH` their own profile to `role=admin`, or
flip their own listing to `published`, from the browser console.

Run the suite that proves it:

```bash
./supabase/tests/run.sh     # needs only a local Postgres, not Supabase
```

## Screens

| Route            | Screen          | Access                          |
| ---------------- | --------------- | ------------------------------- |
| `/`              | Landing         | Everyone                        |
| `/browse`        | Browse pillars  | Everyone                        |
| `/search`        | Search results  | Everyone (`?q=` and `?pillar=`) |
| `/listing/:id`   | Listing profile | Everyone                        |
| `/login`         | Log in          | Everyone                        |
| `/signup`        | Apply to join   | Everyone                        |
| `/pending`       | Application status | Applicants                   |
| `/dashboard`     | Member dashboard | Approved members               |
| `/dashboard/new` | Create listing (4 steps) | Approved members       |
| `/admin`         | Control room    | Admins                          |

Guarded routes return anyone without the right session to the landing page.

## What actually works

The whole loop runs end to end against Supabase:

- **Apply → review → approve.** An application lands in the admin Users queue;
  approving it raises the member count, declining removes it. A pending
  applicant is held on `/pending` and cannot reach the dashboard.
- **Create → review → publish.** A member's listing is created as `pending`,
  shows under My Listings as `PENDING REVIEW`, and appears in the admin
  Listings queue. Publishing it puts it in the public directory and search;
  returning it marks it `returned`.
- **Search** filters published listings by name, pillar, city, title and
  services. Pillar tiles and admin pillar rows deep-link into it.
- **Contact actions** on a listing are real links: `tel:`, `mailto:` and a
  WhatsApp `wa.me` link.
- **Photo slots** accept a click or a drag-and-drop and preview the file
  immediately; the cover carries through to the preview card and profile hero.
- **Validation** runs on both forms and on step 2 of the wizard, with errors
  written per field.
- **Sessions persist** across reloads and refresh themselves; guarded routes
  wait for the session to restore rather than bouncing you out mid-refresh.
- **Images upload** to the `listing-media` bucket, under a folder named for the
  uploader — which is what the bucket policy checks.

## Layout

Mobile-first, full-bleed on a phone. From 480px wide the app settles into a
390px column on the warm backdrop — the composition the design was drawn in.
Notch and home-bar clearance come from `env(safe-area-inset-*)`.

## Structure

```
src/
  App.tsx                 routes and access guards
  components/             shell, tab bar, pillar grid/icons, form primitives
  data/                   pillars, types
  lib/supabase.ts         client, keyed from the two env vars
  lib/api.ts              every call to the backend, in one place
  lib/database.types.ts   row shapes matching the migration
  screens/                one file per screen
  store/AppContext.tsx    session, profiles, listings, admin actions
supabase/
  migrations/0001_init.sql  schema, RLS, triggers, storage bucket
  seed.sql                  optional demo listings
  tests/                    RLS suite + runner
```

Design tokens (`--ink`, `--paper`, `--gold`, `--panel`, the rule opacities) are
declared once in `src/index.css` and used everywhere.

## Still to build

- **Notifications.** Approval and listing decisions should reach members by SMS
  and WhatsApp, which is where this audience already is. Nothing is wired yet;
  the send points are the admin actions in `src/lib/api.ts`.
- **The listing cap.** `profiles.listing_cap` exists and admins can set it, but
  nothing enforces it: a listing that clears review has nowhere to wait, because
  the UI has no queued state. Both halves should land together.
- **Reporting.** Visitors and members should be able to flag a listing to the
  admin queue. No table and no screen yet.
- **French.** The interface is English-only; the product calls for full EN/FR.
- **Static demo figures.** Dashboard views (48) and enquiries (6) are still
  placeholders — the only invented numbers left in the app.

## Sharing a build

```bash
npm run build:single          # one self-contained dist-single/index.html
node scripts/make-artifact.mjs # strips it to a body fragment for publishing
```
