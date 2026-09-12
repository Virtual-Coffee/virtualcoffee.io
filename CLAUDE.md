# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- intent-skills:start -->

## Skill Loading

Before editing files for a substantial task:

- Run `pnpx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Overview

virtualcoffee.io is a Next.js 16 App Router site on Turbopack (React 19, TypeScript, Bootstrap 5.3 SCSS, no Tailwind) deployed on Netlify. Content is a mix of checked-in MDX/TS/JSON and build-time fetches from GitHub and a Craft CMS, both of which fall back to mock data when credentials are absent. Airtable is retired — see `docs/adr/0004`.

## Commands

pnpm is enforced (`preinstall` runs `only-allow pnpm`). Node >= 24.20 (`.nvmrc`).

| Task                                       | Command                                                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install                                    | `pnpm install` (copy `.env.example` to `.env` first)                                                                                                    |
| Dev server                                 | `pnpm dev` — runs the codegen, then `npm-watch` + `netlify dev` (site on <http://localhost:9000>, proxying Next on :3000)                               |
| Next only (no Netlify functions/redirects) | `next dev`                                                                                                                                              |
| Build                                      | `pnpm build` — `prebuild` runs the codegen first                                                                                                        |
| Typecheck                                  | `pnpm typecheck` (`next typegen` then `tsc --noEmit`, the native TypeScript 7 binary)                                                                   |
| Lint                                       | `pnpm lint` (ESLint flat config: `next/core-web-vitals` + `next/typescript`; `netlify/**` is ignored)                                                   |
| Test                                       | `pnpm test` (Vitest, run once; `pnpm test:watch` to watch, `pnpm test:coverage` for a v8 report; CI posts totals to the job summary and a PR comment)   |
| Format                                     | `pnpm format` (Prettier: tabs, single quotes, trailing commas; CI auto-commits fixes on same-repo PR branches only; there is no husky/lint-staged hook) |
| Regenerate all codegen                     | `pnpm codegen` (member barrels + Undraw aspect ratios; **not** the bot list, which is checked in)                                                       |
| Regenerate member barrels                  | `pnpm build-member-files`                                                                                                                               |
| Regenerate Undraw aspect ratios            | `pnpm build-undraw-ratios`                                                                                                                              |
| Regenerate the bot list                    | `pnpm build-bot-list` (fetches the release pinned in `.botlist-version.json`)                                                                           |
| Check the bot matcher                      | `pnpm check-bot-matching` (just `src/data/botMatcher.test.ts`; `pnpm test` covers it, this alias is for `refresh-bot-list.yml`)                         |
| Generate a DB migration                    | `pnpm db:generate --name=<hyphenated-slug>` (drizzle-kit writes straight into `netlify/database/migrations/`)                                           |
| Apply migrations locally                   | `pnpm db:migrate` (needs `netlify dev` running)                                                                                                         |
| Seed local sample applications             | `pnpm db:seed` (also seeds Volunteers, ledger rows and Invites)                                                                                         |
| Run the daily invite upkeep by hand        | `pnpm invite-maintenance` (accrual and expiry; the scheduled function itself answers no requests)                                                       |

`.github/workflows/ci.yml` runs four jobs on every pull request — `format`, `lint`, `typecheck`, `test`. Netlify still owns `pnpm build`; CI does not build. CodeQL (`.github/workflows/codeql.yml`, advanced setup — leave the repository's default-setup toggle off) scans `javascript-typescript` and `actions` on pull requests, pushes to `main` and weekly; its findings go to the Security tab and are not a required check.

The `lint`, `typecheck` and `test` jobs run `pnpm codegen` first, because `src/data/members/{core,members}.ts` and `src/data/undrawAspectRatios.ts` are gitignored codegen and only `prebuild` generates them otherwise. Do the same locally: `pnpm codegen && pnpm typecheck && pnpm lint && pnpm test` before finishing a change.

Neither CI nor those checks run `next build`, so nothing before Netlify's deploy preview exercises prerendering. Run `pnpm build` locally when a change can only fail there — anything touching MDX frontmatter, `generateStaticParams`, or a component that pages render at build time.

`typecheck` shells out to `next typegen` before `tsc` because `next-env.d.ts` is gitignored (Next's docs require this) and is what declares non-code imports like `*.png`. Without it a clean checkout fails on any image import. `typegen` also writes `.next/types/`, so `tsc` validates typed routes without a full build.

The `format` job auto-commits Prettier fixes, but only on branches in this repo, and never on `renovate[bot]`/`dependabot[bot]` branches (a foreign commit stops Renovate rebasing). Fork PRs get no secrets, so they fall back to `prettier --check` and fail with the file list in the job summary — the contributor runs `pnpm format` themselves.

### Testing

Tests are Vitest (`vitest.config.mts`), colocated as `*.test.ts` beside the module, in a plain `node` environment with explicit `import { test, expect } from 'vitest'` — no globals, no jsdom, no React Testing Library. Two projects: `unit` (`*.test.ts` under `src/`, `scripts/` and `netlify/`; `pnpm test --project unit` is the fast loop) and `db` (`*.db.test.ts`, anything that touches the database). `@/` is an alias in the Vitest config, not a tsconfig-paths plugin. `tsconfig.json` already includes `**/*.ts`, so `pnpm typecheck` sees test files, and `@vitest/eslint-plugin`'s recommended rules apply to them (no focused or skipped tests).

Async Server Components can't be rendered by a unit runner (Next's own guidance), so pages are not unit-tested; Netlify's deploy preview is still what exercises rendering. Server actions _are_ tested, by calling them: `'use server'` is inert under Node, `db()` and `auth` are lazy, so a submission that fails validation returns its `fieldErrors` without a database, and `redirect()`/`notFound()` are asserted on the thrown digest (`src/test/next.ts`). The zod schemas stay private to their action files on purpose.

The `db` project runs against `@netlify/database-dev` — the in-memory PGlite engine `netlify dev` already uses, behind a Postgres wire server — started once per run by `src/test/db/globalSetup.ts`, which applies `netlify/database/migrations/` verbatim; `src/test/db/setup.ts` points `NETLIFY_DB_URL` at it before anything calls `db()`, mocks `next/cache` (`revalidatePath` throws outside a request), and truncates every schema table after each test. No `netlify dev`, no Docker, nothing extra in CI. PGlite is one session, so concurrent transactions are serialised: `.for('update')` and the conditional updates run, but their races cannot be staged — idempotency is shown by calling twice. **Tests authenticate through the dev bypass, not by mocking auth:** `signInAs(roles, slackId)` in `src/test/session.ts` stubs `ADMIN_DEV_BYPASS`, and `getSession()` returns that session before it touches `next/headers` or Better Auth, so `requirePermission()` and `requireVolunteer()` run for real. Fixtures are in `src/test/db/fixtures.ts`; a mocked `sendEmail`/`notifySlack` is declared per file, and must _return_ a failure rather than reject — that is the real functions' contract.

`@/*` maps to `./src/*`.

Two TypeScript packages are installed on purpose: `typescript` is aliased to `@typescript/typescript6` (the JS compiler API that typescript-eslint and `next build` need) and `@typescript/native` is aliased to `typescript@7` (provides the native `tsc` binary used by `pnpm typecheck`). Keep both until typescript-eslint supports TypeScript 7.

## Architecture

### Data sources and the mock gate

Every external data source lives in `src/data/` and degrades to mocks when its env var is missing:

| Source                                          | File                        | Env var                                           | Fallback                                        |
| ----------------------------------------------- | --------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| Member GitHub profiles                          | `src/data/members/index.ts` | `GITHUB_TOKEN`                                    | `src/data/mocks/memberData.js` (faker)          |
| GitHub Sponsors                                 | `src/data/sponsors.ts`      | `GITHUB_TOKEN`                                    | `src/data/mocks/sponsors.ts`                    |
| Events (Craft CMS + Solspace Calendar GraphQL)  | `src/data/events.ts`        | `CMS_URL`, `CMS_TOKEN`                            | `src/data/mocks/events.ts`                      |
| Submission and membership notifications (Slack) | `src/lib/slack/notify.ts`   | `SLACK_WEBHOOK_*`                                 | failure recorded as an event, shown in `/admin` |
| Lunch & Learn GitHub issue                      | `src/lib/github/issues.ts`  | `GITHUB_APP_CLIENT_ID` / `GITHUB_APP_PRIVATE_KEY` | same                                            |
| Slack member directory (`/admin` grant picker)  | `src/data/slackMembers.ts`  | `SLACK_BOT_TOKEN`                                 | `src/data/mocks/slackMembers.ts` (faker)        |
| Membership applications (`/join`, `/admin`)     | `src/db/`                   | none (auto-provisioned)                           | local Postgres from `netlify dev`               |

`src/data/mocks/index.ts` exports `assertMocksAllowed()`, which throws when Netlify's `CONTEXT === 'production'`. Any new external fetch should follow this pattern: try the API, fall back to a mock guarded by `assertMocksAllowed`. Fetches are wrapped in `unstable_cache` with a tag (`members`, `events`, `mdx-routes`); `/_cache?tag=…&path=…` (`src/app/%5Fcache/route.ts`) revalidates on demand and a daily GitHub Action triggers a Netlify rebuild.

### Membership pipeline (Postgres)

`/join` writes a Membership Application to Netlify Database and `/admin` is where maintainers work the queue. The panel is organised by section: `/admin` is a dashboard scoped to what the viewer may see, the waitlist owns `/admin/waitlist/*` (queue, `archive/`, and the `[id]` detail page), `/admin/submissions/[kind]/*` covers the four Submission kinds, `/admin/volunteers/*` is the Volunteer roster and their Invite Allowances, and `/admin/user-management` manages who has access. A new section is a new segment beside `waitlist/`, with its routes and its own components under it — `(protected)/presentation.tsx` is the only shared piece. **Adding a Section also needs a branch in `dashboardCards()`**: it falls through to a lookup of Submission kinds, so anything else silently renders no card at all. See `CONTEXT.md` for the vocabulary (a **Member Profile** in `src/content/members/` is a voluntary public listing and is unrelated to a **Membership Application**) and `docs/adr/0001-0009`.

**Access to `/admin` is per-section.** `src/lib/permissions.ts` declares one access-control resource per section with `read`/`manage`, and roles live comma-separated in `user.role`. The `(protected)` layout only checks that the viewer holds _some_ section — **each page must gate itself with `requirePermission()`, and each server action must re-check independently.** A section with no check of its own is reachable by every role. See `docs/adr/0006`.

**Volunteer Invites are the exception to all of that.** `volunteer` is a Role that grants _no_ Section, and `/invites` lives outside `/admin` behind `requireVolunteer()` in `src/lib/volunteerAccess.ts` — deliberately not `adminRoutesEnabled()`, which 404s the whole admin tree on deploy previews. The allowance is an append-only ledger summed on read (spend once, refund once — the partial unique indexes enforce it, `invites/actions.db.test.ts` and `inviteMaintenance.db.test.ts` pin it), accrued by a daily Netlify scheduled function (`netlify/functions/invite-maintenance.ts`), and `volunteer` is excluded from `GRANTABLE_ROLES` because `/admin/volunteers` must write the `volunteer` row and the Role together (`volunteers/actions.db.test.ts` pins that, and that pausing clears both). See `docs/adr/0010-0012`.

Access can be **pre-provisioned**: a **Pending Grant** (`pending_grant`) assigns roles to a Slack member id before that person has ever signed in, and `claimPendingGrant()` (`src/lib/pendingGrants.ts`) applies it from `databaseHooks.account.create.after` — not the user hook, because the Slack member id only exists on the account and Better Auth will not let `mapProfileToUser` write an `input: false` field. Matching is **never on email** (`pendingGrants.db.test.ts`); `ADMIN_BOOTSTRAP_SLACK_IDS` replaced `ADMIN_BOOTSTRAP_EMAILS` for the same reason. See `docs/adr/0009`.

- Schema is Drizzle in `src/db/schema.ts`, on Drizzle **v1** (pinned to an exact `1.0.0-rc.*`, no caret — Renovate proposes bumps as a reviewable diff). `pnpm db:generate` is a bare `drizzle-kit generate` whose `out` is `netlify/database/migrations/` itself: v1 names each migration `<YYYYMMDDHHmmss>_<name>/migration.sql`, which is exactly the layout Netlify applies on deploy, so there is no copy step. **Always pass `--name=<hyphenated-slug>`** — drizzle's auto-generated names use underscores and Netlify's slugs are lowercase alphanumerics and hyphens only. The `snapshot.json` beside each `migration.sql` is drizzle-kit's diff base, committed on purpose; Netlify ignores it. **Never edit a migration that has already deployed.**
- **Primary keys are UUIDv7, never sequential** (`newId()` in `src/db/ids.ts`; Better Auth's tables keep their own `text` ids). They appear in `/admin` URLs, so they must stay opaque. `membership_application` and the four submission tables also carry a sequential `reference` integer, which is the number the UI shows and **must never appear in a URL**. Any route reading an id from the URL has to pass it through `isId()` before querying — Postgres raises `22P02` on a malformed literal against a `uuid` column, so an unchecked param throws instead of 404ing. See `docs/adr/0008`.
- `netlify dev` starts a local Postgres; `getDatabase()` finds it automatically. One-off scripts run outside that runtime, so they go through `scripts/with-local-netlify.ts`, which fetches the local connection string and refuses to run against anything non-local. It also starts a second Netlify Blobs server over `netlify dev`'s own sandbox directory, so a script that writes attachments writes them where the running site can serve them; that half is best-effort and skipped when the site is not linked. `scripts/airtable/README.md` documents the one-off imports that use it.
- Auth is Better Auth with Slack OAuth (`src/lib/auth.ts`). Version 1.7.3 has no `team` option, so the workspace check is in `mapProfileToUser`. Netlify seeds every deploy preview's database branch from production; `pnpm db:sanitize-preview` (`scripts/sanitizePreviewDb.ts`) scrubs that branch to fake data as the last step of the build and fails the build loudly if it can't (see `netlify.toml`, `docs/adr/0007`), which is what makes `PREVIEW_ADMIN_BYPASS=true` safe to unblock `/admin` on a preview at all. `ADMIN_DEV_BYPASS=true` is the separate, local-only equivalent for contributors without Slack credentials.
- Any admin action that emails must **send first and only then write the status change**, and report whether anything went out. The UI tells the maintainer "nothing was emailed — safe to try again", and they decide whether to retry on that basis; getting it backwards double-emails applicants. `waitlist/actions.db.test.ts` and `transport.test.ts` (which failures count as `definitelyNotSent`) pin this.

### Submissions (Postgres)

The four public forms — `/report-coc-violation`, `/volunteer-at-virtual-coffee`, `/lunch-and-learn-idea`, `/start-coffee-table-group` — each have a zod-validated server action writing to their own table, with a shared `submission_event` log. They **persist first and notify second**, deliberately inverting the "send first, then write" rule below; `docs/adr/0005` explains why, and it will look like a bug without it. The `action.db.test.ts` beside each form pins the ordering.

All four — and `/join` — are `force-dynamic` because the spam guard (`src/util/forms/spamGuard.ts`) signs a per-render token — prerendering would bake one into the cached HTML and reject every submission once it expired. CoC attachments go to Netlify Blobs and are served only through a route that checks `coc:read`.

Podcast episodes are a checked-in JSON snapshot (`src/data/podcast/episodes.json`) copied from the `vc-data` repo; the update procedure is in the comment at the top of `src/data/podcast.ts`. Newsletters are local JSX files under `src/content/newsletters/` listed in `src/data/newsletters.ts`.

### Members pipeline (generated files)

- One file per member in `src/content/members/members/<github-username>.ts` (core team in `core/`), exporting a `MemberObject` (`src/content/members/types.ts`). Template: `_EXAMPLE.ts`.
- The filename and the exported identifier are both pinned to the `MemberObject`'s `github` field by `vc/member-file-identity` (`eslint-rules/`). `github` is the lookup key — `getMembers()` returns `null` for a name GitHub doesn't know, silently dropping that member — and the export name is the key of the namespace object `src/data/members/index.ts` iterates, so two files exporting the same name make it ambiguous under `export *`. The filename match is case-insensitive (`getMembers()` lowercases); the identifier is exact, with `-` becoming `_` and a leading digit gaining an `_` prefix.
- `scripts/loadMemberFiles.ts` generates `src/data/members/core.ts` and `src/data/members/members.ts` as barrel re-exports. **These two files are gitignored and generated — never hand-edit them; run `pnpm build-member-files` after adding a member.**
- The other codegen is `scripts/loadUndrawAspectRatios.ts`, which reads the `viewBox` of every SVG in `public/assets/svg` into the gitignored `src/data/undrawAspectRatios.ts`. `UndrawIllustration` renders through `next/image`, which needs concrete dimensions, and a hand-maintained map had drifted to covering barely half the files. Run `pnpm build-undraw-ratios` after adding an SVG.
- `getMembers()` merges the local overrides with GitHub GraphQL data (batched 15 logins per query) and team membership from `src/content/members/teams.ts`.

### The bot list (generated, but checked in)

`src/data/bots.ts` is generated by `scripts/loadBotList.ts` from [ai-robots-txt/ai.robots.txt](https://github.com/ai-robots-txt/ai.robots.txt) and sorted into three tiers — `blockedUas` (harvesters), `allowedUas` (AI search and agents fetching for a person right now) and `robotsOnlyUas` (opt-out directives that never appear as a User-Agent). Both `src/app/robots.ts` and the edge function read it.

Unlike the other codegen it is **checked in**, so it is not part of `pnpm codegen`: a build-time fetch would put a GitHub outage between us and a working deploy, the Deno bundle needs the file to exist, and committing it means every change to who we block arrives as a reviewable diff. Never hand-edit it — edit the policy and regenerate.

- **`.botlist-version.json`** pins the upstream release, so two runs a week apart produce the same file. Renovate bumps it through the `jsonata` custom manager in `renovate.json` — a structural query on the `version` field, rather than a regex, because Renovate reports a non-matching manager as "no dependency found" rather than as an error.
- **`src/data/botOverrides.ts`** holds every policy decision: which upstream categories map to the allowed tier, tokens always allowed or always blocked, scrapers upstream doesn't track, and the robots.txt-only signals. The generator exits non-zero if an override doesn't reach the tier it names, and warns if upstream has dropped one.
- **`.github/workflows/refresh-bot-list.yml`** regenerates and opens a PR: on push to `main` when the pin changes (Renovate can't run the generator itself — `postUpgradeTasks` is blocked on the hosted app), and weekly as a safety net. A weekly run that produces a diff means the committed file drifted from the overrides, and the PR says so.
- **`src/data/botMatcher.ts`** is shared by the edge function and `src/data/botMatcher.test.ts`; `createBotPolicy()` there is the precedence rule (an allowed token wins over a blocked one), so the test exercises what the edge function runs. Matching is fenced by token boundaries, not `includes`: upstream carries tokens like `Code` (GitHub Copilot), and a substring match on it also catches `vscode`.

### MDX content pipeline

- `next.config.mjs` configures `@next/mdx` with remark-frontmatter, a custom TOC plugin (`src/mdx-plugins/remark-toc.mjs`, replaces a `## Table of Contents` heading with a generated list), rehype-slug, a rehype-autolink-headings wrapper (`src/mdx-plugins/rehype-heading-anchors.mjs`, h2/h3), and rehype-highlight. Plugins are referenced by path string because Turbopack requires serializable MDX loader options; put any plugin that needs function options in `src/mdx-plugins/`. Because the path is the whole cache key, editing a plugin's _contents_ does not invalidate compiled MDX — Next will happily reuse stale output, on Netlify too. `localMdxPlugin()` in `next.config.mjs` mixes a hash of the plugin file into its options to force invalidation; wire new local plugins through it. If MDX output ever looks stale anyway, `rm -rf .next` and rebuild to confirm before debugging the plugin itself.
- `src/util/loadMdx.server.ts` walks a content directory and reads only frontmatter (`meta.title`, `meta.description`, `hero`, `order`); the page then dynamically `import()`s the `.mdx` file itself.
- Routes: `src/app/(simple-mdx)/[...slug]/page.tsx` serves `src/content/simple-mdx-pages/*.mdx`; `src/app/resources/[[...slug]]/page.tsx` serves the nested `src/content/resources/` tree (`index.mdx` is a directory's own page, siblings are children sorted by `order`). Both are `force-static` with `dynamicParams = false`. Adding a resource is just adding an `.mdx` file with frontmatter; index listings come from `<FileIndex />` (`src/components/content/FileIndex.tsx`).
- `src/mdx-components.tsx` is a passthrough; MDX files import components explicitly from `@/components/content/`.
- The site nav (`src/components/Nav.tsx`) is hand-written, not derived from content.

### Layout, styling, HTML safety

- `src/components/layouts/DefaultLayout.tsx` is the only page layout; every page wraps its content in it (`Hero`, `heroHeader`, `heroSubheader`, `simple` props). Root layout in `src/app/layout.tsx` imports `src/styles/main.scss`.
- Styles are à-la-carte Bootstrap 5.3 SCSS partials plus per-feature partials in `src/styles/`; markup uses Bootstrap classes and a custom `prose` class. Legacy Sass `@import` deprecations are silenced in `next.config.mjs`, and `quietDeps` mutes Bootstrap's own internal deprecations so warnings from `src/styles/` still surface.
- `src/styles/_variables.scss` holds the Bootstrap overrides and is imported _before_ `_bootstrap.scss`, so it cannot reference a Bootstrap variable or call a Bootstrap function — use literals. Any Sass **map** assigned there fully replaces Bootstrap's rather than merging, so write maps out in full (`$spacers` must keep keys 0–5 or every `.m-*`/`.p-*`/`.g-*` utility disappears). Keep `$font-family-sans-serif` a single flat list; composing it from another list nests it, and v5 emits that into `--bs-body-font-family` as invalid CSS.
- In `_bootstrap.scss` the import order is load-bearing: `utilities` is only the config map and must precede `root`, while `utilities/api` emits the utility classes and must stay last so the project partials can override them.
- All HTML from external sources goes through `src/util/sanitizeCmsData.ts` (`sanitizeHtml` / `sanitizeCmsData`); `src/util/markdown.server.ts` deliberately uses this instead of rehype-sanitize so there is one allowlist.
- The `.server.ts` suffix marks server-only modules (a Remix holdover); it is a naming convention, not enforced.

### Netlify

- `netlify/functions/join-coffee.ts` is a redirect function (env: `ZOOM_TUESDAYS`, `ZOOM_THURSDAYS`); `/join-slack` is a route handler in `src/app/join-slack/route.ts` (env: `SLACK_JOIN_LINK`). `netlify/edge-functions/block-bots.ts` returns 403 to harvesting user agents on every path — on deploys only, since it is skipped in local dev unless `BLOCK_BOTS_LOCAL=true` is set in `.env` (the CLI does not pass plain process env vars to edge functions), and it lets user-initiated agents through. It reads the deploy context from `context.deploy.context` (`Netlify.env.get('CONTEXT')` is build-scope and undefined at the edge), and logs one `[blocked]` line per refusal — `[dev bypass]` locally, where it matches but does not refuse. Its list is `src/data/bots.ts` (see [The bot list](#the-bot-list-generated-but-checked-in)); it imports that with an explicit `.ts` extension because it bundles for Deno.
- `netlify.toml` holds the legacy 301 map, the `/join-coffee` rewrite, a `/bots/*` proxy to a Cloudflare Worker, and the Plausible analytics proxy. Add new URL redirects there, not in Next config.

## Content conventions

- Monthly challenges: prose lives in `src/app/monthlychallenges/page.tsx` (`challengeList`) plus one static page per month under `src/app/monthlychallenges/(challenges)/<mon-year>/`. Follow the process in the VC Community Building Resources "Monthly Challenge Technical Guidelines" linked from the README. The entry data for past challenges is a frozen snapshot in `src/data/monthlyChallenges/data/*.json` — see `docs/adr/0004` for why it is JSON and not database tables.
- Member emoji must be standard Unicode; maintainers reject PRs otherwise.
- PRs should link an issue (`Closes #123`); the PR template asks for Description and Methodology sections.
