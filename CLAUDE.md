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

CI runs `format:check`, `lint`, `typecheck` and `build`, in that order, on every pull request and on pushes to `main`.

No test runner is configured, so there is no test command yet.

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

- `proxy.ts` (the Next.js 16 name for middleware) redirects `/dashboard/*` to `/sign-in` when there is no session cookie. It only looks at the cookie, never the database.
- `lib/dal.ts` `getCurrentUser()` does the real check against the database and redirects when the session is invalid. Every server page, action or handler that needs the user must call it. With `cacheComponents`, a component that calls it must render inside `<Suspense>`. Keep it out of a layout's top level, so the shell stays prerendered (the dashboard routes build as Partial Prerender).

## Onboarding

Each owner has at most one `Business`. `/onboarding` is a three-step client wizard (business, first service, working hours) that submits once to the `completeOnboarding` Server Action in `app/onboarding/actions.ts`. The action re-checks the user and re-validates with `onboardingSchema`, then saves everything in one nested `prisma.business.create`. A `P2002` error there means the slug is taken. `getCurrentBusiness()` in `lib/dal.ts` drives the redirects both ways: `RequireBusiness`, rendered in the dashboard layout, sends owners without a business to `/onboarding`, and `/onboarding` sends owners who already have one to `/dashboard`.

Server Actions are public endpoints, so every action must call the DAL and validate its input on the server, even when the form already validated it.

## Planned, not yet installed

`.env.example` also lists a `CRON_SECRET` that protects a daily demo reset route.

## Figma reference

`docs/figma-reference/` is a generated Figma Make prototype, kept as a visual reference for layout, copy and sample data. Do not import from it. It is excluded from TypeScript, ESLint and Prettier, so it does not have to meet the project's checks.

## Conventions

- Line endings are LF, enforced by `.gitattributes` and Prettier. This matters because development happens on Windows.
- `tsconfig.json` sets `noUncheckedIndexedAccess`, so indexed access returns `T | undefined`.
- Prettier sorts Tailwind classes through `prettier-plugin-tailwindcss`.
