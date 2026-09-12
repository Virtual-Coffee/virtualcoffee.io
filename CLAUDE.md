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

## Overview

virtualcoffee.io is a Next.js 16 App Router site on Turbopack (React 19, TypeScript, Bootstrap 5.3 SCSS, no Tailwind) deployed on Netlify. Content is a mix of checked-in MDX/TS and build-time fetches from GitHub, a Google Calendar, and Airtable; the GitHub and Calendar fetches fall back to mock data when credentials are absent, while the Airtable-backed features degrade to empty data or an error state (see the table below).

## Commands

pnpm is enforced (`preinstall` runs `only-allow pnpm`). Node >= 24.20 (`.nvmrc`).

| Task                                       | Command                                                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install                                    | `pnpm install` (copy `.env.example` to `.env` first)                                                                                                    |
| Dev server                                 | `pnpm dev` — runs the codegen, then `npm-watch` + `netlify dev` (site on http://localhost:9000, proxying Next on :3000)                                 |
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

`.github/workflows/ci.yml` runs four jobs on every pull request — `format`, `lint`, `typecheck`, `test`. Netlify still owns `pnpm build`; CI does not build. CodeQL (`.github/workflows/codeql.yml`, advanced setup — leave the repository's default-setup toggle off) scans `javascript-typescript` and `actions` on pull requests, pushes to `main` and weekly; its findings go to the Security tab and are not a required check.

The `lint`, `typecheck` and `test` jobs run `pnpm codegen` first, because `src/data/members/{core,members}.ts` and `src/data/undrawAspectRatios.ts` are gitignored codegen and only `prebuild` generates them otherwise. Do the same locally: `pnpm codegen && pnpm typecheck && pnpm lint && pnpm test` before finishing a change.

Neither CI nor those checks run `next build`, so nothing before Netlify's deploy preview exercises prerendering. Run `pnpm build` locally when a change can only fail there — anything touching MDX frontmatter, `generateStaticParams`, or a component that pages render at build time.

`typecheck` shells out to `next typegen` before `tsc` because `next-env.d.ts` is gitignored (Next's docs require this) and is what declares non-code imports like `*.png`. Without it a clean checkout fails on any image import. `typegen` also writes `.next/types/`, so `tsc` validates typed routes without a full build.

The `format` job auto-commits Prettier fixes, but only on branches in this repo, and never on `renovate[bot]`/`dependabot[bot]` branches (a foreign commit stops Renovate rebasing). Fork PRs get no secrets, so they fall back to `prettier --check` and fail with the file list in the job summary — the contributor runs `pnpm format` themselves.

### Testing

Tests are Vitest (`vitest.config.mts`), colocated as `*.test.ts` beside the module, in a plain `node` environment with explicit `import { test, expect } from 'vitest'` — no globals, no jsdom, no React Testing Library. They cover the pure modules: the HTML allowlist, the markdown renderer, the `remark-toc` plugin, date and URL helpers, the mock gate, the bot matcher. `@/` is an alias in the Vitest config, not a tsconfig-paths plugin. `tsconfig.json` already includes `**/*.ts`, so `pnpm typecheck` sees test files, and `@vitest/eslint-plugin`'s recommended rules apply to them (no focused or skipped tests).

Async Server Components can't be rendered by a unit runner (Next's own guidance), so pages are not unit-tested; Netlify's deploy preview is still what exercises rendering. The config declares a second project, `db`, matching `*.db.test.ts` and empty for now: when the first database-backed test lands it gets a `globalSetup` on `@netlify/database-dev` — the in-memory PGlite engine `netlify dev` already runs — so those tests will need neither `netlify dev` nor Docker. Keep the `.db.test.ts` suffix for anything that touches the database.

`@/*` maps to `./src/*`.

Two TypeScript packages are installed on purpose: `typescript` is aliased to `@typescript/typescript6` (the JS compiler API that typescript-eslint and `next build` need) and `@typescript/native` is aliased to `typescript@7` (provides the native `tsc` binary used by `pnpm typecheck`). Keep both until typescript-eslint supports TypeScript 7.

## Architecture

### Data sources and the mock gate

Every external data source lives in `src/data/` and degrades to mocks when its env var is missing:

| Source                                           | File                              | Env var                                            | Fallback                               |
| ------------------------------------------------ | --------------------------------- | -------------------------------------------------- | -------------------------------------- |
| Member GitHub profiles                           | `src/data/members/index.ts`       | `GITHUB_TOKEN`                                     | `src/data/mocks/memberData.js` (faker) |
| GitHub Sponsors                                  | `src/data/sponsors.ts`            | `GITHUB_TOKEN`                                     | `src/data/mocks/sponsors.ts`           |
| Events (Google Calendar API via service account) | `src/data/events.ts`              | `GOOGLE_SERVICE_ACCOUNT_KEY`, `GOOGLE_CALENDAR_ID` | `src/data/mocks/events.ts`             |
| Monthly challenge counters                       | `src/data/monthlyChallenges/*.ts` | `PUBLIC_AIRTABLE_API_KEY`                          | empty data                             |
| Form submissions (server actions)                | `src/util/airtable/action.ts`     | `FORMS_AIRTABLE_API_KEY`                           | error state returned to the form       |

`src/data/mocks/index.ts` exports `assertMocksAllowed()`, which throws when Netlify's `CONTEXT === 'production'`. Any new external fetch should follow this pattern: try the API, fall back to a mock guarded by `assertMocksAllowed`. Fetches are wrapped in `unstable_cache` with a tag (`members`, `events`, `mdx-routes`); `/_cache?tag=…&path=…` (`src/app/%5Fcache/route.ts`) revalidates on demand and a daily GitHub Action triggers a Netlify rebuild.

Podcast episodes are a checked-in JSON snapshot (`src/data/podcast/episodes.json`) copied from the `vc-data` repo; the update procedure is in the comment at the top of `src/data/podcast.ts`. Newsletters are local JSX files under `src/content/newsletters/` listed in `src/data/newsletters.ts`.

### Members pipeline (generated files)

- One file per member in `src/content/members/members/<github-username>.ts` (core team in `core/`), exporting a `MemberObject` (`src/content/members/types.ts`). Template: `_EXAMPLE.ts`.
- The filename and the exported identifier are both pinned to the `MemberObject`'s `github` field by `vc/member-file-identity` (`eslint-rules/`). `github` is the lookup key — `getMembers()` returns `null` for a name GitHub doesn't know, silently dropping that member — and the export name is the key of the namespace object `src/data/members/index.ts` iterates, so two files exporting the same name make it ambiguous under `export *`. The filename match is case-insensitive (`getMembers()` lowercases); the identifier is exact, with `-` becoming `_` and a leading digit gaining an `_` prefix.
- `scripts/loadMemberFiles.ts` generates `src/data/members/core.ts` and `src/data/members/members.ts` as barrel re-exports. **These two files are gitignored and generated — never hand-edit them; run `pnpm build-member-files` after adding a member.**
- The other codegen is `scripts/loadUndrawAspectRatios.ts`, which reads the `viewBox` of every SVG in `public/assets/svg` into the gitignored `src/data/undrawAspectRatios.ts`. `UndrawIllustration` renders through `next/image`, which needs concrete dimensions, and a hand-maintained map had drifted to covering barely half the files. Run `pnpm build-undraw-ratios` after adding an SVG.

### The bot list (generated, but checked in)

`src/data/bots.ts` is generated by `scripts/loadBotList.ts` from [ai-robots-txt/ai.robots.txt](https://github.com/ai-robots-txt/ai.robots.txt) and sorted into three tiers — `blockedUas` (harvesters), `allowedUas` (AI search and agents fetching for a person right now) and `robotsOnlyUas` (opt-out directives that never appear as a User-Agent). Both `src/app/robots.ts` and the edge function read it.

Unlike the other codegen it is **checked in**, so it is not part of `pnpm codegen`: a build-time fetch would put a GitHub outage between us and a working deploy, the Deno bundle needs the file to exist, and committing it means every change to who we block arrives as a reviewable diff. Never hand-edit it — edit the policy and regenerate.

- **`.botlist-version.json`** pins the upstream release, so two runs a week apart produce the same file. Renovate bumps it through the `jsonata` custom manager in `renovate.json` — a structural query on the `version` field, rather than a regex, because Renovate reports a non-matching manager as "no dependency found" rather than as an error.
- **`src/data/botOverrides.ts`** holds every policy decision: which upstream categories map to the allowed tier, tokens always allowed or always blocked, scrapers upstream doesn't track, and the robots.txt-only signals. The generator exits non-zero if an override doesn't reach the tier it names, and warns if upstream has dropped one.
- **`.github/workflows/refresh-bot-list.yml`** regenerates and opens a PR: on push to `main` when the pin changes (Renovate can't run the generator itself — `postUpgradeTasks` is blocked on the hosted app), and weekly as a safety net. A weekly run that produces a diff means the committed file drifted from the overrides, and the PR says so.
- **`src/data/botMatcher.ts`** is shared by the edge function and `src/data/botMatcher.test.ts`; `createBotPolicy()` there is the precedence rule (an allowed token wins over a blocked one), so the test exercises what the edge function runs. Matching is fenced by token boundaries, not `includes`: upstream carries tokens like `Code` (GitHub Copilot), and a substring match on it also catches `vscode`.
- `getMembers()` merges the local overrides with GitHub GraphQL data (batched 15 logins per query) and team membership from `src/content/members/teams.ts`.

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

- `netlify/functions/join-coffee.ts` and `join-slack.ts` are redirect functions (env: `ZOOM_TUESDAYS`, `ZOOM_THURSDAYS`, `SLACK_JOIN_LINK`). `netlify/edge-functions/block-bots.ts` returns 403 to harvesting user agents on every path — on deploys only, since it is skipped in local dev unless `BLOCK_BOTS_LOCAL=true` is set in `.env` (the CLI does not pass plain process env vars to edge functions), and it lets user-initiated agents through. It reads the deploy context from `context.deploy.context` (`Netlify.env.get('CONTEXT')` is build-scope and undefined at the edge), and logs one `[blocked]` line per refusal — `[dev bypass]` locally, where it matches but does not refuse. Its list is `src/data/bots.ts` (see [The bot list](#the-bot-list-generated-but-checked-in)); it imports that with an explicit `.ts` extension because it bundles for Deno.
- `netlify.toml` holds the legacy 301 map, the `/join-*` rewrites, a `/bots/*` proxy to a Cloudflare Worker, and the Plausible analytics proxy. Add new URL redirects there, not in Next config.

## Content conventions

- Monthly challenges: prose lives in `src/app/monthlychallenges/page.tsx` (`challengeList`) plus one static page per month under `src/app/monthlychallenges/(challenges)/<mon-year>/`. Follow the process in the VC Community Building Resources "Monthly Challenge Technical Guidelines" linked from the README.
- Member emoji must be standard Unicode; maintainers reject PRs otherwise.
- PRs should link an issue (`Closes #123`); the PR template asks for Description and Methodology sections.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
