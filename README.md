# SlotBook

Online booking for solo service providers (nail artists, massage therapists, barbers). The provider shares **one link**. Clients pick a service, a day and a free time, and book **without creating an account**.

**Live demo:** https://slotbook-six.vercel.app. Use the "explore the owner dashboard" link on the landing page to sign in as a demo owner with sample data (it resets every day).

> This is a portfolio project, built in four weeks by one developer: [Nina Kostenko](https://github.com/ninakostenko).

## What it does

**For clients** (`/book/<link>`)

- Choose a service, then a day on a calendar. Closed days and days off are greyed out.
- See every working time of the day. Taken times are struck through.
- Enter a name and an e-mail, and book. No sign-up.
- A confirmation page (`/booking/<secret>`) shows the details and lets the client cancel.

**For the owner** (`/dashboard`)

- Sign up, then a three-step onboarding: business, first service, working hours.
- Services (create, edit, hide), weekly schedule with 15-minute times, days off.
- Bookings list: upcoming by day, earlier and cancelled below, cancel with a confirmation.
- Overview with today's numbers, the next bookings and a "copy my link" button.
- Settings for the business name and description.

## Tech stack

| Area      | Choice                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions, Cache Components with partial prerender) |
| Language  | TypeScript (strict, `noUncheckedIndexedAccess`)                                                     |
| Database  | PostgreSQL on Neon, Prisma 7 with the `pg` driver adapter                                           |
| Auth      | Better Auth (e-mail and password)                                                                   |
| UI        | Tailwind CSS 4, shadcn/ui (Radix), React Hook Form, Zod, react-day-picker                           |
| Tests     | Vitest                                                                                              |
| CI / host | GitHub Actions (format, lint, typecheck, test, build) and Vercel, with a daily cron job             |

## Interesting parts

- **No double bookings, even in a race.** The app hides taken times and checks again on the server. But two clients can pass that check at the same moment, so the database has the last word: a PostgreSQL **exclusion constraint** (`EXCLUDE USING gist` on the business and a time range) in a hand-written migration. The server turns its error into "This time was just taken". Back-to-back bookings are allowed, and cancelled ones do not block their time.
- **Time zones done carefully.** Bookings are stored as exact moments (`timestamptz`). Days off are stored as plain dates. Every calculation about "which day" or "what time" happens in the **business's** time zone, never the server's or the browser's, through small tested helpers in `lib/time.ts`.
- **Slot generation is a pure function.** `getAvailableSlots` in `lib/slots.ts` knows nothing about the database. It takes working hours, bookings and a service length, and returns start times. That makes it easy to test. `lib/availability.ts` is the thin layer that loads the data. Start times follow the service length, so a 65-minute service starts every 65 minutes.
- **Server Actions are public endpoints.** Each one checks the user through a data access layer (`lib/dal.ts`), validates its input with Zod again on the server, and scopes every write to the owner's business (`updateMany` with `businessId` in the `where`), so an id sent from the browser cannot reach another business's data.
- **Cancelling without an account.** Each booking has a random `cancelToken`. The confirmation page is found by it and is not indexed by search engines.
- **A safe demo.** A one-click demo sign-in, and a cron route (`/api/demo/reset`, protected by a secret) that rebuilds the demo business every day. The reset only touches the business that belongs to the demo e-mail.

## Run it locally

You need Node 22 or later (see `.nvmrc`) and a PostgreSQL database. A free [Neon](https://neon.tech) project works well.

```bash
npm install
cp .env.example .env      # then fill in the values below
npx prisma migrate deploy # create the tables
npm run dev               # http://localhost:3000
```

If `npm install` crashes with `Cannot read properties of null (reading 'edgesOut')` (npm 10.5), run it again with `--legacy-peer-deps`.

| Variable             | What it is                                                                |
| -------------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`       | Pooled connection string, used by the app                                 |
| `DIRECT_URL`         | Direct connection string, used by migrations                              |
| `BETTER_AUTH_SECRET` | A long random string that signs sessions                                  |
| `BETTER_AUTH_URL`    | The site address, for example `http://localhost:3000`                     |
| `CRON_SECRET`        | Protects the demo reset route. Vercel Cron sends it as a bearer token     |
| `DEMO_PASSWORD`      | The demo owner's password. Visitors never see it; the demo button uses it |

### Scripts

| Command                | What it does                      |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Dev server                        |
| `npm run build`        | Production build                  |
| `npm test`             | Vitest                            |
| `npm run lint`         | ESLint                            |
| `npm run typecheck`    | Generates route types, runs `tsc` |
| `npm run format`       | Prettier, write changes           |
| `npm run format:check` | Prettier, check only              |

Open the demo business after the first demo sign-in at `/book/demo-studio`, or reset it by hand:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/demo/reset
```

## Project layout

```text
app/            routes: landing, (auth), onboarding, (dashboard)/dashboard, book/[slug], booking/[token], api
components/     UI by feature (booking, bookings, services, schedule, settings, ...) and shadcn in ui/
lib/            slots.ts, availability.ts, time.ts, dal.ts, auth.ts, demo.ts, validations/
prisma/         schema.prisma and migrations (the exclusion constraint is a hand-written one)
docs/           figma-reference: a visual reference from the first design, not imported by the app
```

## Roadmap

- English and Ukrainian interface
- E-mails: booking confirmation and reminders
- Change the booking link from Settings
- Photos for the business page

## Deploy

The app deploys to Vercel from `main`. Set all the variables above there. `vercel.json` registers the daily demo reset (`0 3 * * *`).
