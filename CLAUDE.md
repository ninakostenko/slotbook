# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

SlotBook is online booking for solo service providers: they share one link, and clients book a free time without an account. The project is at an early stage: only a landing page exists so far.

Read [AGENTS.md](AGENTS.md) too. This Next.js version differs from what you may know, so check `node_modules/next/dist/docs/` before writing Next.js code. `next dev` re-adds the AGENTS.md block if it is removed, so leave it in place.

## Commands

Node 22 or later (see `.nvmrc`), with npm.

```bash
npm run dev           # dev server at http://localhost:3000
npm run build         # production build
npm run lint          # ESLint
npm run typecheck     # next typegen, then tsc --noEmit
npm run format        # Prettier, write changes
npm run format:check  # Prettier, check only
```

CI runs `format:check`, `lint`, `typecheck`, `test` and `build`, in that order, on every pull request and on pushes to `main`.

`npm test` runs Vitest (`vitest.config.mts`, files `**/*.test.ts`) through `scripts/test.mjs`. The wrapper upper-cases the drive letter, because Vitest started from a `c:\` path (VS Code's default on Windows) loads itself twice and every test fails with "Cannot read properties of undefined (reading 'config')". CI runs `npm test` after `typecheck`.

npm 10.5 sometimes crashes on install with "Cannot read properties of null (reading 'edgesOut')". Adding `--legacy-peer-deps` gets past it; `vite` is a direct dev dependency so that flag still installs it.

## Architecture

- **Next.js 16 App Router.** There is no `src/` directory: `app/`, `components/` and `lib/` are at the root, and `@/*` maps to the root.
- **`cacheComponents` and `partialPrefetching` are on** in `next.config.ts`. Both change how data fetching and rendering must be written, so read the docs guide before adding dynamic data.
- **Generated route types.** Global types such as `LayoutProps<"/">` come from `next typegen`, which is why `typecheck` runs it first.
- **Tailwind CSS v4 has no `tailwind.config` or PostCSS config.** It is configured in `app/globals.css` and loaded through the `@tailwindcss/turbopack` loader in `next.config.ts`.
- **Design tokens are in `app/globals.css`.** Colors are CSS variables on `:root` and `.dark`, exposed to Tailwind through `@theme inline`. Use the semantic classes (`bg-primary`, `text-muted-foreground`) rather than raw colors. Dark mode is class-based, on `.dark`.
- **shadcn/ui** components go in `components/ui/` (`components.json`: style `radix-nova`, icons from `lucide`). They use the unified `radix-ui` package. `cn` comes from the `cn` npm package, and `lib/utils.ts` re-exports it for shadcn's `@/lib/utils` alias.

## Database

Prisma 7 with Neon Postgres. Prisma is pinned to 7.10.1 on purpose: npm's `latest` tag pointed at an 8.0 release candidate when it was installed, so ignore Prisma's "update available" notice.

- `prisma/schema.prisma` holds the models. The `User`, `Session`, `Account` and `Verification` models follow the shape Better Auth expects.
- `prisma.config.ts` points the CLI at `DIRECT_URL`, the direct connection used for migrations. In Prisma 7 the schema has no `url`.
- The client is generated into `lib/generated/prisma/`, which is gitignored. `npm install` regenerates it through `postinstall`. Import the shared instance from `@/lib/db`, which connects through `@prisma/adapter-pg` using the pooled `DATABASE_URL`.
- To change the schema, run `npx prisma migrate dev --name <change>`, then `npx prisma generate`.
- The constraint that blocks overlapping bookings is planned as a hand-written SQL migration: a PostgreSQL exclusion constraint on `Booking`.

## Auth

Better Auth with email and password. The server config is in `lib/auth.ts` (Prisma adapter, `nextCookies` plugin last), the browser client is in `lib/auth-client.ts`, and every `/api/auth/*` request goes through `app/api/auth/[...all]/route.ts`. The `/sign-up` and `/sign-in` pages are in the `app/(auth)` route group. Their forms are client components in `components/auth/`, built with React Hook Form and validated by the Zod schemas in `lib/validations/auth.ts`.

Protected pages are checked twice:

- `proxy.ts` (the Next.js 16 name for middleware) redirects `/dashboard/*` and `/onboarding` to `/sign-in` when there is no session cookie. It only looks at the cookie, never the database. It also rewrites every page request to its language (see Languages).
- `lib/dal.ts` `getCurrentUser()` does the real check against the database and redirects when the session is invalid. Every server page, action or handler that needs the user must call it. With `cacheComponents`, a component that calls it must render inside `<Suspense>`. Keep it out of a layout's top level, so the shell stays prerendered (the dashboard routes build as Partial Prerender).

## Onboarding

Each owner has at most one `Business`. `/onboarding` is a three-step client wizard (business, first service, working hours) that submits once to the `completeOnboarding` Server Action in `app/[locale]/onboarding/actions.ts`. The action re-checks the user and re-validates with `onboardingSchema`, then saves everything in one nested `prisma.business.create`. A `P2002` error there means the slug is taken. `getCurrentBusiness()` in `lib/dal.ts` drives the redirects both ways: `RequireBusiness`, rendered in the dashboard layout, sends owners without a business to `/onboarding`, and `/onboarding` sends owners who already have one to `/dashboard`.

Server Actions are public endpoints, so every action must call the DAL and validate its input on the server, even when the form already validated it.

## Schedule and time

`WorkingHours` stores minutes from midnight (540 = 09:00), one row per working day. Missing days are closed. `lib/time.ts` holds `weekDays` (Monday first; `dayOfWeek` 0 = Sunday), `timeToMinutes`, `minutesToTime` and `timeOptions`. `updateSchedule` replaces all of a business's rows in one `prisma.$transaction` (`deleteMany`, then `createMany`). Time fields use `components/schedule/time-select.tsx` (shadcn Select, 24-hour, 15-minute steps) instead of `<input type="time">`, whose native picker cannot be styled and shows AM/PM on some systems. Keep storage locale-free; if i18n is added, format only the labels with `Intl.DateTimeFormat`.

Days off (`TimeOff.date`, `@db.Date`) travel as `"YYYY-MM-DD"` strings (`timeOffSchema`, `z.iso.date()`) and are stored at midnight UTC with `new Date(\`${date}T00:00:00Z\`)`. Never build them from local `Date`parts on the server or with`toISOString()`in the browser, because either can shift the day.`toDateString`, `todayInTimeZone`(uses`business.timezone`) and `formatDay`(formats in UTC) in`lib/time.ts`handle the conversions. A duplicate date is caught as`P2002`from the`@@unique([businessId, date])` constraint, not checked beforehand.

## Services

`/dashboard/services` lists the business's services, with create and edit dialogs in `components/services/` and actions in `app/[locale]/(dashboard)/dashboard/services/actions.ts`. Each action follows the same order: get the business from the DAL, `safeParse` the input, write, then `revalidatePath`. Updates use `updateMany` with `where: { id, businessId }` and treat `count === 0` as not found, so an owner cannot change another business's rows by sending its id. Services are hidden with `isActive`, never deleted, because bookings reference them. The active switch uses `useOptimistic` inside `startTransition`.

## Languages

The interface is in English and Ukrainian. Every page lives under `app/[locale]/`, but the address never shows the language: `proxy.ts` reads the `locale` cookie (or the browser's Accept-Language) and rewrites `/dashboard` to `/uk/dashboard` behind the scenes. So each page is still prerendered once per language, and the dashboard stays Partial Prerender. A visitor who types `/uk/...` is redirected to the plain address and the cookie is set. `LocaleSwitcher` sets the cookie and reloads the page.

All text is in `lib/i18n/messages/en.ts` (the source of truth) and `uk.ts` (typed to have the same keys). `lib/i18n/messages.test.ts` checks the keys, the `{placeholders}`, and that every key used in the code exists. Server Components get the language from `params` (`getI18n(params)` in `lib/i18n/server.ts`), and Client Components use `useT()` from the provider that the layout adds. `t()` returns a text that is not a key as it is, so it is safe to call on anything. The Zod messages and the `error` strings that Server Actions return are keys of the messages; `FieldError` and the forms translate them. Pass the page language to the `formatDay*` helpers in `lib/time.ts` and use `calendarLocales` for calendars, so dates are written the same on the server and in the browser. Revalidate with the route pattern, for example `revalidatePath("/[locale]/dashboard/services", "page")`, so every language is refreshed. The fonts include the Cyrillic subset.

## Bookings, dashboard and demo

A client books on `/book/[slug]` (`createBooking` in `app/[locale]/book/[slug]/actions.ts`), then lands on `/booking/[token]`, a private page found by the booking's `cancelToken`, where they can cancel (`cancelBookingByToken`). Double booking is blocked twice: `getSlotsForDay` hides taken times, and the `Booking_no_overlap` exclusion constraint (a hand-written migration) makes the database refuse an overlap. `isOverlapError` in `lib/booking-errors.ts` recognises that error, and `createBooking` answers "This time was just taken". The owner sees bookings in `/dashboard/bookings` and cancels them with `cancelBooking`. Slot start times follow the length of the service: a 65-minute service starts every 65 minutes.

The whole app uses one rose palette and the serif `font-display` for headings. The tokens are in `app/globals.css`.

**Demo.** The landing page has a button that calls the `startDemo` Server Action (`app/demo/actions.ts`). It signs in as `demo@slotbook.app` with `DEMO_PASSWORD` and redirects to `/dashboard`. `resetDemo` in `lib/demo.ts` rebuilds the demo business "Lumi Beauty Studio" (`/book/demo-studio`) from the sample data in `lib/demo-data.ts`. It only touches the business owned by the demo e-mail, because the database is shared with real data. Vercel Cron calls `GET /api/demo/reset` daily (`vercel.json`) with `Authorization: Bearer <CRON_SECRET>`. Both `DEMO_PASSWORD` and `CRON_SECRET` must also be set on Vercel, and the demo password must be the same value everywhere.

## Figma reference

`docs/figma-reference/` is a generated Figma Make prototype, kept as a visual reference for layout, copy and sample data. Do not import from it. It is excluded from TypeScript, ESLint and Prettier, so it does not have to meet the project's checks.

## Conventions

- Line endings are LF, enforced by `.gitattributes` and Prettier. This matters because development happens on Windows.
- `tsconfig.json` sets `noUncheckedIndexedAccess`, so indexed access returns `T | undefined`.
- Prettier sorts Tailwind classes through `prettier-plugin-tailwindcss`.
