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

virtualcoffee.io is a Next.js App Router site deployed on Netlify. Content is checked-in MDX/TS/JSON plus build-time fetches that fall back to mock data when credentials are absent; the membership pipeline and the public forms live in Netlify Database (Airtable is retired — `docs/adr/0004`).

## Commands

Scripts are in `package.json`; `pnpm` is enforced. What no script name tells you:

- `pnpm dev` is `netlify dev` in front of Next (site on :9000). `pnpm dev:tunnel` sets `NETLIFY_TUNNEL=1`, which gates the tunnel-only settings in `next.config.mjs`.
- `pnpm codegen` regenerates the gitignored generated files (see [Generated files](#generated-files)) and deliberately excludes the checked-in bot list.
- `pnpm typecheck` runs `next typegen` first because the gitignored `next-env.d.ts` is what declares image imports; a clean checkout fails on any `*.png` without it.
- `pnpm db:migrate` needs `netlify dev` running. Deploys apply migrations in `netlify.toml`'s build command.
- There is no husky/lint-staged hook; CI (`.github/workflows/ci.yml`) auto-commits Prettier fixes on same-repo branches.
- CI does not build. Run `pnpm build` locally when a change can only fail at prerender: MDX frontmatter, `generateStaticParams`, or a component pages render at build time.
- `pnpm knip` (config in `knip.ts`) finds unused files, exports and dependencies; run `pnpm codegen` first. Content directories are entries, not ignores, so their own imports are still checked.
- CodeQL is advanced-setup: `.github/workflows/codeql.yml` is the whole config, and the repository's default-setup toggle stays off.
- `typescript` is `@typescript/typescript6` (for typescript-eslint and `next build`) and `@typescript/native` is `typescript@7` (the `tsc` that `pnpm typecheck` runs), so the build and CI check with different compilers. Keep both until typescript-eslint supports TypeScript 7.

Before finishing a change: `pnpm codegen && pnpm typecheck && pnpm lint && pnpm test && pnpm knip`.

When writing or debugging a test, read `docs/testing.md` first.

## Architecture

### Data sources and the mock gate

Every external read in `src/data/` (members, sponsors, events, Slack members) degrades to a mock in `src/data/mocks/` when its credentials are missing. Outbound senders (`src/lib/slack/notify.ts`, `src/lib/github/issues.ts`, `src/lib/email/transport.ts`) are Captured instead, and a failure is an event shown in `/admin`; membership data is local Postgres from `netlify dev`.

A new external fetch is a `defineSource()` (`src/data/source.ts`): it owns the mock gate and the tagged `unstable_cache`; production throws where anywhere else falls back to the mock.

A revalidation interval is declared once, beside the fetch in `src/data/*`; pages export no `revalidate`, and a page that reads only checked-in content (MDX, the podcast JSON) is static until the next deploy. Do not wrap a synchronous or `fs` read in `unstable_cache`: it hands its `revalidate` and tags to every page that calls it. A credential-less fetch where `null` is a valid answer skips `defineSource()`; copy the `fetchTranscript` / `getTranscript` pair in `src/data/podcast.ts`.

The Events Calendar is the system of record for Series and Events; `/admin/events` is a client of the Calendar API and stores nothing — `docs/adr/0014`. The shape of a Series or an Event is declared once, in `src/lib/events/eventDraft.ts` (with recurrence in `src/lib/events/recurrence.ts`), and the admin forms and `events/actions.ts` both parse against it.

### Membership pipeline (Postgres)

Before touching `src/db`, `src/lib/{access,history,waitlist,volunteers,submissions}`, `/admin`, `/invites`, `/join` or a public form, or anything that sends (email, a Slack post, a GitHub issue, an Events Calendar write), read `CONTEXT.md` for the vocabulary and `docs/agents/membership.md` for the rules; each rule cites the ADR that decided it.

Podcast episodes are a checked-in JSON snapshot copied from the `vc-data` repo (procedure in the comment at the top of `src/data/podcast.ts`); membership data stays out of that repo — `docs/adr/0002`. Newsletters are JSX files under `src/content/newsletters/` listed in `src/data/newsletters.ts`.

### Generated files

- `src/data/members/{core,members}.ts`, `src/data/undrawAspectRatios.ts` and `src/data/resourcePaths.ts` are gitignored; `pnpm codegen` writes them. Run `pnpm build-member-files` after adding a member, `pnpm build-undraw-ratios` after adding an SVG to `public/assets/svg` (`UndrawIllustration` needs concrete dimensions for `next/image`) and `pnpm build-resource-paths` after adding or moving a file in `src/content/resources` (`ResourcePath` types `resourceHref()`).
- `src/data/bots.ts` is generated but **checked in**, so a GitHub outage cannot block a deploy and every change to who is blocked is a reviewable diff. Edit the policy in `src/data/botOverrides.ts` and regenerate with `pnpm build-bot-list`. When changing who is blocked, read `docs/bot-list.md` first.

### Members pipeline

- One file per member in `src/content/members/members/<github-username>.ts` (core team in `core/`), exporting a `MemberObject`; `_EXAMPLE.ts` is the template.
- `vc/member-file-identity` (`eslint-rules/`) pins the filename and exported identifier to the `MemberObject`'s `github` field: `github` is the GitHub lookup key (`getMembers()` silently drops a name GitHub doesn't know), and the export name is the key `src/data/members/index.ts` iterates. Filename match is case-insensitive; the identifier is exact, with `-` → `_` and a leading digit prefixed with `_`.

### Routes and MDX content pipeline

- `typedRoutes` is on and no route is a root catch-all; build a `/resources` href with `resourceHref()` — `docs/adr/0019`.
- Editing a plugin in `src/mdx-plugins/` invalidates compiled MDX only when it's wired through `localMdxPlugin()` in `next.config.mjs`; if output looks stale anyway, `rm -rf .next` and rebuild before debugging the plugin.
- `src/util/loadMdx.server.ts` reads only frontmatter (`meta.title`, `meta.description`, `hero`, `order`); the page then `import()`s the `.mdx` file. Adding a resource is adding an `.mdx` file with frontmatter under `src/content/resources/`; index listings come from `<FileIndex />`.
- MDX files import components explicitly from `@/components/content/`. `src/mdx-components.tsx` maps only what Markdown itself generates, which no import can reach: `a` → `MdxLink`, so a page path goes through `next/link`. A JSX `<a>` written in MDX compiles to a literal `<a>` and bypasses it, so write internal links as Markdown. `src/content/links.test.ts` fails on a root-relative link that is not a page the site serves (a `netlify.toml` redirect source included). The site nav (`src/components/Nav.tsx`) is hand-written, not derived from content.

### Layout, styling, HTML safety

- `src/components/layouts/DefaultLayout.tsx` is the only page layout (`Hero`, `heroHeader`, `heroSubheader`, `simple` props).
- Styles are à-la-carte Bootstrap SCSS partials (no Tailwind) plus per-feature partials in `src/styles/`; markup uses Bootstrap classes and a custom `prose` class. The Sass load-order and map rules are in the headers of `src/styles/_variables.scss` and `src/styles/_bootstrap.scss`; read them before editing either. `quietDeps` in `next.config.mjs` mutes Bootstrap's own deprecations so warnings from `src/styles/` still surface.
- All HTML from external sources goes through `src/util/sanitizeCmsData.ts`; `src/util/markdown.server.ts` uses it instead of rehype-sanitize so there is one allowlist.
- `createMetaData`, `loadMdx` and `markdown` `.server.ts` start with `import 'server-only'` (Next resolves it, no dependency; Vitest aliases it to `src/test/serverOnly.ts`), so a client import is a build error. `url.server.ts` is exempt: `netlify/functions` and `tsx` scripts import it. The suffix alone enforces nothing.

### Netlify

- `netlify/edge-functions/block-bots.ts` refuses harvesting user agents on deploys only (`BLOCK_BOTS_LOCAL` in `.env.example`). It bundles for Deno, so its imports from `src/` carry an explicit `.ts` extension.
- `CONTEXT` is read through `deployContext()` (`src/lib/deployContext.ts`): `production`, `preview` or `local`, an unknown value counting as a preview — `docs/adr/0018`.
- `CONTEXT` and `DEPLOY_PRIME_URL` are build-scope, so `next.config.mjs` inlines them into `process.env.*` reads; otherwise a running function sees a deploy as a local checkout — `docs/adr/0007`.
- URL redirects go in `netlify.toml`, beside the legacy 301 map, rather than in Next config. `/join-slack` is a page (`src/app/join-slack/`), not a redirect function.

### Error monitoring

Sentry (`@sentry/nextjs`), errors + tracing only; rationale in `docs/adr/0015`; source maps and the `/monitoring` tunnel are configured in `next.config.mjs`.

- Off without `NEXT_PUBLIC_SENTRY_DSN`; Netlify sets it for every deploy context, `.env` locally is opt-in.
- Every `Sentry.init` passes `dataCollection` from `src/sentryDataCollection.ts` (v11 is permissive when it's unset); loosening it is a policy change. Keep the CoC report form out of Sentry: its route is on the `PII_ROUTES` list.
- A caught failure a maintainer must act on goes through `reportHandled()` (`src/lib/monitoring/reportHandled.ts`), which scrubs it; the server's `beforeSend` strips frame locals on `PII_ROUTES`.
- Errors with frames outside our bundles are tagged `third_party_code:true`, not dropped; only Netlify's RUM beacon failure is dropped.
- Releases are commit SHAs with commits and Netlify deploys attached by the build; `Fixes VIRTUALCOFFEE-IO-N` in a commit message resolves that Sentry issue on merge.

## Content conventions

- Monthly challenges: one `.mdx` per challenge under `src/content/monthly-challenges/`; the frontmatter schema and loader are in `src/data/monthlyChallenges/index.ts`. Past entry data is a frozen JSON snapshot in `src/data/monthlyChallenges/data/` — `docs/adr/0004`.
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

Greptile reviews every PR except those from the bots in `excludeAuthors`; label one `skip-review` to opt out. Its config is `.greptile/`, and how Renovate PRs and the dashboard are handled is in `.greptile/README.md`. A new ADR gets a `files.json` entry — `docs/agents/domain.md`.
