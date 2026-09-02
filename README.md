# MPUGLOBAL — MarketPlace Unlimited

Front end for MarketPlace Unlimited: a vetted business directory for the
Cameroonian market and its diaspora, organised into sixteen pillars.

Built from the Claude Design handoff (`MPUGLOBAL v2.dc.html`) and the product
brief (`MarketPlace Unlimited (MPUGLOBAL).docx`). **Front end only** — all data
lives in the browser. See [Backend boundary](#backend-boundary).

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle → dist/
npm run lint       # tsc project-wide typecheck
```

## Demo accounts

| Role   | Email                 | Password |
| ------ | --------------------- | -------- |
| Member | `adaeze@example.com`  | `member` |
| Admin  | `admin@mpuglobal.com` | `admin`  |

The landing page's `ADMIN` link signs in as the administrator directly.

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

The whole loop runs end to end against the in-browser store:

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
- **State persists** across reloads in `localStorage`.

## Layout

Mobile-first, full-bleed on a phone. From 480px wide the app settles into a
390px column on the warm backdrop — the composition the design was drawn in.
Notch and home-bar clearance come from `env(safe-area-inset-*)`.

## Structure

```
src/
  App.tsx                 routes and access guards
  components/             shell, tab bar, pillar grid/icons, form primitives
  data/                   pillars, seed users and listings, types
  screens/                one file per screen
  store/AppContext.tsx    session, users, listings, admin actions
  store/persist.ts        localStorage read/write
```

Design tokens (`--ink`, `--paper`, `--gold`, `--panel`, the rule opacities) are
declared once in `src/index.css` and used everywhere.

## Backend boundary

Everything below is deliberately client-side and is where the API will attach:

- **Auth** — passwords are compared in plain text in `AppContext.login`. Replace
  with a real session/token exchange.
- **Data** — `src/data/seed.ts` seeds users and listings; `persist.ts` mirrors
  them to `localStorage`. Replace with API reads and writes.
- **Uploads** — images are read to data URLs and held in memory only; they are
  stripped before persisting so they cannot exhaust the storage quota.
- **Static demo figures** — dashboard views (48) and enquiries (6), and the
  directory-wide `PILLAR_COUNTS`, are placeholders for real analytics.

## Sharing a build

```bash
npm run build:single          # one self-contained dist-single/index.html
node scripts/make-artifact.mjs # strips it to a body fragment for publishing
```
