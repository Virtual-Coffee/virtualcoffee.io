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

virtualcoffee.io is a Next.js App Router site (Bootstrap SCSS, no Tailwind) deployed on Netlify. Content is checked-in MDX/TS/JSON plus build-time fetches that fall back to mock data when credentials are absent; the membership pipeline lives in Netlify Database.

## Commands

Scripts are in `package.json`; `pnpm` is enforced. What no script name tells you:

- `pnpm dev` is `netlify dev` in front of Next (site on :9000). `pnpm dev:tunnel` sets `NETLIFY_TUNNEL=1`, which gates the tunnel-only settings in `next.config.mjs`.
- `pnpm codegen` regenerates the gitignored generated files (see [Generated files](#generated-files)) and deliberately excludes the checked-in bot list.
- `pnpm typecheck` runs `next typegen` first because the gitignored `next-env.d.ts` is what declares image imports; a clean checkout fails on any `*.png` without it.
- `pnpm db:migrate` needs `netlify dev` running. Deploys apply migrations in `netlify.toml`'s build command.
- There is no husky/lint-staged hook; CI (`.github/workflows/ci.yml`) auto-commits Prettier fixes on same-repo branches.
- CI does not build. Run `pnpm build` locally when a change can only fail at prerender: MDX frontmatter, `generateStaticParams`, or a component pages render at build time.
- `pnpm knip` (config in `knip.ts`) finds unused files, exports and dependencies; run `pnpm codegen` first. Every entry in `knip.ts` carries its reason in a comment; content directories are entries, not ignores, so their own imports are still checked. The CI job is `continue-on-error` until this stack has merged, because each layer exports things only the layer above imports — the follow-up is #1589.
- CodeQL is advanced-setup: `.github/workflows/codeql.yml` is the whole config, and the repository's default-setup toggle stays off.
- `typescript` is aliased to `@typescript/typescript6` (the compiler API typescript-eslint and `next build` need) and `@typescript/native` to `typescript@7` (the `tsc` binary). Keep both until typescript-eslint supports TypeScript 7.

Before finishing a change: `pnpm codegen && pnpm typecheck && pnpm lint && pnpm test && pnpm knip`.

When writing or debugging a test, read `docs/testing.md` first.

## Architecture

### Data sources and the mock gate

Every external data source lives in `src/data/` and degrades to a mock when its credentials are missing:

| Source                                      | File                        | Fallback                               |
| ------------------------------------------- | --------------------------- | -------------------------------------- |
| Member GitHub profiles                      | `src/data/members/index.ts` | `src/data/mocks/memberData.js` (faker) |
| GitHub Sponsors                             | `src/data/sponsors.ts`      | `src/data/mocks/sponsors.ts`           |
| Events (Craft CMS)                          | `src/data/events.ts`        | `src/data/mocks/events.ts`             |
| Slack member directory (`/admin` grant picker) | `src/data/slackMembers.ts` | `src/data/mocks/slackMembers.ts` (faker) |
| Membership applications (`/join`, `/admin`) | `src/db/`                   | local Postgres from `netlify dev`      |

`src/data/mocks/index.ts` exports `assertMocksAllowed()`, which throws when Netlify's `CONTEXT === 'production'`. A new external fetch follows this pattern: try the API, fall back to a mock guarded by `assertMocksAllowed`, and wrap the fetch in `unstable_cache` with a tag so `/_cache?tag=…&path=…` (`src/app/%5Fcache/route.ts`) can revalidate it.

### Membership pipeline (Postgres)

Before touching `src/db`, `src/lib/access`, `src/lib/history`, `src/app/join` or `src/app/admin`, read `CONTEXT.md` for the vocabulary. Each rule below cites the ADR that decided it; open the ADR before changing the rule.

`/admin` is organised by Section, one route segment each under `src/app/admin/(protected)/`; the modules directly under `(protected)/` are shared. Adding a Section is a type error in `CARDS` (`src/lib/admin/dashboard.ts`) until it has a dashboard card or is excluded.

- `/admin` — the dashboard, scoped to what the viewer may see
- `/admin/user-management` — who has access

Rules:

- Every `/admin` page and server action gates itself with `requirePermission()` (`src/lib/access/adminAccess.ts`); the `(protected)` layout only proves the viewer holds _some_ section — `docs/adr/0003`, `docs/adr/0006`.
- A Pending Grant (`src/lib/access/pendingGrants.ts`) matches on the Slack member id — `docs/adr/0009`.
- `src/lib/history/eventLog.ts` is the only writer of `application_event` and `submission_event`: `recordOutcome()` turns a send into History, `transitionAndRecord()` commits a status change with its event. Labels in `src/lib/history/eventLabels.ts` are keyed by the enums, so a new event type is a type error until labelled.
- A schema change is a new migration: `pnpm db:generate --name=<hyphenated-slug>`, both generated files committed — `docs/adr/0001`.
- `id` (UUIDv7, `newId()` in `src/db/ids.ts`) is the URL and foreign-key handle, checked with `isId()` on the way in; `reference` is display-only — `docs/adr/0008`.
- One-off scripts run through `scripts/with-local-netlify.ts`, which supplies the local connection string and refuses anything non-local.
- `ADMIN_DEV_BYPASS*` (`.env.example`) signs a local checkout in without Slack; a real session cookie takes precedence over it.
- A deploy preview is production's data behind production's Slack sign-in; `OAUTH_PROXY_SECRET` holds one value in every Netlify context — `docs/adr/0007`.

Podcast episodes are a checked-in JSON snapshot copied from the `vc-data` repo (procedure in the comment at the top of `src/data/podcast.ts`); membership data stays out of that repo — `docs/adr/0002`. Newsletters are JSX files under `src/content/newsletters/` listed in `src/data/newsletters.ts`.

### Generated files

- `src/data/members/{core,members}.ts` and `src/data/undrawAspectRatios.ts` are gitignored; `pnpm codegen` writes them and CI runs it before lint, typecheck and test. Run `pnpm build-member-files` after adding a member and `pnpm build-undraw-ratios` after adding an SVG to `public/assets/svg` (`UndrawIllustration` needs concrete dimensions for `next/image`).
- `src/data/bots.ts` is generated but **checked in**, so a GitHub outage cannot block a deploy and every change to who is blocked is a reviewable diff. Edit the policy in `src/data/botOverrides.ts` and regenerate with `pnpm build-bot-list`. When changing who is blocked, read `docs/bot-list.md` first.

### Members pipeline

- One file per member in `src/content/members/members/<github-username>.ts` (core team in `core/`), exporting a `MemberObject`; `_EXAMPLE.ts` is the template.
- `vc/member-file-identity` (`eslint-rules/`) pins the filename and exported identifier to the `MemberObject`'s `github` field: `github` is the GitHub lookup key (`getMembers()` silently drops a name GitHub doesn't know), and the export name is the key `src/data/members/index.ts` iterates. Filename match is case-insensitive; the identifier is exact, with `-` → `_` and a leading digit prefixed with `_`.

### MDX content pipeline

- MDX plugins are referenced by path string in `next.config.mjs` because Turbopack requires serializable loader options; a plugin that needs function options lives in `src/mdx-plugins/`. The path is the whole cache key, so editing a plugin's _contents_ does not invalidate compiled MDX (on Netlify too) — `localMdxPlugin()` mixes a hash of the plugin file into its options; wire new local plugins through it. If MDX output looks stale anyway, `rm -rf .next` and rebuild before debugging the plugin.
- `src/util/loadMdx.server.ts` reads only frontmatter (`meta.title`, `meta.description`, `hero`, `order`); the page then `import()`s the `.mdx` file. Adding a resource is adding an `.mdx` file with frontmatter under `src/content/resources/`; index listings come from `<FileIndex />`.
- MDX files import components explicitly from `@/components/content/`; `src/mdx-components.tsx` is a passthrough. The site nav (`src/components/Nav.tsx`) is hand-written, not derived from content.

### Layout, styling, HTML safety

- `src/components/layouts/DefaultLayout.tsx` is the only page layout (`Hero`, `heroHeader`, `heroSubheader`, `simple` props).
- Styles are à-la-carte Bootstrap SCSS partials plus per-feature partials in `src/styles/`; markup uses Bootstrap classes and a custom `prose` class. The Sass load-order and map rules are in the headers of `src/styles/_variables.scss` and `src/styles/_bootstrap.scss`; read them before editing either. `quietDeps` in `next.config.mjs` mutes Bootstrap's own deprecations so warnings from `src/styles/` still surface.
- All HTML from external sources goes through `src/util/sanitizeCmsData.ts`; `src/util/markdown.server.ts` uses it instead of rehype-sanitize so there is one allowlist.
- The `.server.ts` suffix marks server-only modules by convention (a Remix holdover); nothing enforces it.

### Netlify

- `netlify/edge-functions/block-bots.ts` refuses harvesting user agents on deploys only; locally it matches but lets through unless `BLOCK_BOTS_LOCAL=true` is in `.env` (the CLI does not pass plain process env vars to edge functions). It reads the deploy context from `context.deploy.context` — `Netlify.env.get('CONTEXT')` is build-scope and undefined at the edge — and imports `src/data/bots.ts` with an explicit `.ts` extension because it bundles for Deno.
- URL redirects go in `netlify.toml`, beside the legacy 301 map, rather than in Next config.

### Error monitoring

Sentry (`@sentry/nextjs`), errors + tracing only. Init files: `src/instrumentation-client.ts` (browser), `sentry.server.config.ts`, `sentry.edge.config.ts` (dispatched from `src/instrumentation.ts`), and `src/app/global-error.tsx` for a root-layout crash. `next.config.mjs` wraps the config in `withSentryConfig` (org `virtual-coffee-nw`, project `virtualcoffee-io`), which uploads source maps after the Turbopack build when `SENTRY_AUTH_TOKEN` is set — Netlify's build env only — and rewrites `/monitoring` as the event tunnel.

- Off without `NEXT_PUBLIC_SENTRY_DSN`; Netlify sets it for every deploy context, `.env` locally is opt-in.
- Never pass `dataCollection` or `sendDefaultPii`: the CoC report form must not reach Sentry. Rationale in `docs/adr/0015-error-monitoring-with-sentry.md`.
- `environment` is the Netlify `CONTEXT`, inlined as `NEXT_PUBLIC_SENTRY_ENVIRONMENT` in `next.config.mjs`.
- Releases are commit SHAs with commits and Netlify deploys attached by the build; `Fixes VIRTUALCOFFEE-IO-N` in a commit message resolves that Sentry issue on merge.

## Content conventions

- Monthly challenges: prose in `src/app/monthlychallenges/page.tsx` (`challengeList`) plus one static page per month under `src/app/monthlychallenges/(challenges)/<mon-year>/`, following the "Monthly Challenge Technical Guidelines" linked from the README. Past entry data is a frozen JSON snapshot in `src/data/monthlyChallenges/data/` — `docs/adr/0004`.
- Member emoji are standard Unicode; maintainers reject PRs otherwise.
- PRs link an issue (`Closes #123`) and fill the template's Description and Methodology sections.

## Agent skills

### Issue tracker

GitHub Issues on `Virtual-Coffee/virtualcoffee.io` via `gh`. When a skill says "publish to the issue tracker", "fetch the relevant ticket" or names wayfinding, read `docs/agents/issue-tracker.md`.

### Triage labels

When a skill applies a triage label, read `docs/agents/triage-labels.md` for the repo's label names.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. When a skill asks for the domain docs, read `docs/agents/domain.md`.

### Code review

Label a PR `greptile-review` (or `coderabbit-review` for CodeRabbit) to get a bot review. Greptile's config is `.greptile/`; its `ignorePatterns` and `.coderabbit.yaml`'s `path_filters` stay identical. A new ADR gets a `files.json` entry — `docs/agents/domain.md`.
