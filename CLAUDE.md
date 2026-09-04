# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

virtualcoffee.io is a Next.js 15 App Router site (React 19, TypeScript, Bootstrap 4.6 SCSS, no Tailwind) deployed on Netlify. Content is a mix of checked-in MDX/TS and build-time fetches from GitHub, a Craft CMS, and Airtable, all of which fall back to mock data when credentials are absent.

## Commands

pnpm is enforced (`preinstall` runs `only-allow pnpm`). Node >= 24.20 (`.nvmrc`).

| Task                                       | Command                                                                                                                                |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Install                                    | `pnpm install` (copy `.env.example` to `.env` first)                                                                                   |
| Dev server                                 | `pnpm dev` — regenerates member barrels, then runs `npm-watch` + `netlify dev` (site on http://localhost:9000, proxying Next on :3000) |
| Next only (no Netlify functions/redirects) | `next dev`                                                                                                                             |
| Build                                      | `pnpm build` — `prebuild` runs the member codegen first                                                                                |
| Typecheck                                  | `pnpm typecheck` (`tsc --noEmit`)                                                                                                      |
| Lint                                       | `pnpm lint` (ESLint flat config: `next/core-web-vitals` + `next/typescript`; `netlify/**` is ignored)                                  |
| Format                                     | `pnpm format` (Prettier: tabs, single quotes, trailing commas; a GitHub Action auto-formats PRs; there is no husky/lint-staged hook)   |
| Regenerate member barrels                  | `pnpm build-member-files`                                                                                                              |

There is no test suite and no test runner. CI does not run lint/typecheck/build on PRs; Netlify runs `pnpm build`. Run `pnpm typecheck && pnpm lint` before finishing a change.

`@/*` maps to `./src/*`.

## Architecture

### Data sources and the mock gate

Every external data source lives in `src/data/` and degrades to mocks when its env var is missing:

| Source                                         | File                              | Env var                   | Fallback                               |
| ---------------------------------------------- | --------------------------------- | ------------------------- | -------------------------------------- |
| Member GitHub profiles                         | `src/data/members/index.ts`       | `GITHUB_TOKEN`            | `src/data/mocks/memberData.js` (faker) |
| GitHub Sponsors                                | `src/data/sponsors.ts`            | `GITHUB_TOKEN`            | `src/data/mocks/sponsors.ts`           |
| Events (Craft CMS + Solspace Calendar GraphQL) | `src/data/events.ts`              | `CMS_URL`, `CMS_TOKEN`    | `src/data/mocks/events.ts`             |
| Monthly challenge counters                     | `src/data/monthlyChallenges/*.ts` | `PUBLIC_AIRTABLE_API_KEY` | empty data                             |
| Form submissions (server actions)              | `src/util/airtable/action.ts`     | `FORMS_AIRTABLE_API_KEY`  | error state returned to the form       |

`src/data/mocks/index.ts` exports `assertMocksAllowed()`, which throws when Netlify's `CONTEXT === 'production'`. Any new external fetch should follow this pattern: try the API, fall back to a mock guarded by `assertMocksAllowed`. Fetches are wrapped in `unstable_cache` with a tag (`members`, `events`, `mdx-routes`); `/_cache?tag=…&path=…` (`src/app/%5Fcache/route.ts`) revalidates on demand and a daily GitHub Action triggers a Netlify rebuild.

Podcast episodes are a checked-in JSON snapshot (`src/data/podcast/episodes.json`) copied from the `vc-data` repo; the update procedure is in the comment at the top of `src/data/podcast.ts`. Newsletters are local JSX files under `src/content/newsletters/` listed in `src/data/newsletters.ts`.

### Members pipeline (generated files)

- One file per member in `src/content/members/members/<github-username>.ts` (core team in `core/`), exporting a `MemberObject` (`src/content/members/types.ts`). Template: `_EXAMPLE.ts`.
- `scripts/loadMemberFiles.ts` generates `src/data/members/core.ts` and `src/data/members/members.ts` as barrel re-exports. **These two files are gitignored and generated — never hand-edit them; run `pnpm build-member-files` after adding a member.**
- `getMembers()` merges the local overrides with GitHub GraphQL data (batched 15 logins per query) and team membership from `src/content/members/teams.ts`.

### MDX content pipeline

- `next.config.mjs` configures `@next/mdx` with remark-frontmatter, a locally defined TOC plugin (replaces a `## Table of Contents` heading with a generated list), rehype-slug, rehype-autolink-headings (h2/h3), and rehype-highlight.
- `src/util/loadMdx.server.ts` walks a content directory and reads only frontmatter (`meta.title`, `meta.description`, `hero`, `order`); the page then dynamically `import()`s the `.mdx` file itself.
- Routes: `src/app/(simple-mdx)/[...slug]/page.tsx` serves `src/content/simple-mdx-pages/*.mdx`; `src/app/resources/[[...slug]]/page.tsx` serves the nested `src/content/resources/` tree (`index.mdx` is a directory's own page, siblings are children sorted by `order`). Both are `force-static` with `dynamicParams = false`. Adding a resource is just adding an `.mdx` file with frontmatter; index listings come from `<FileIndex />` (`src/components/content/FileIndex.tsx`).
- `src/mdx-components.tsx` is a passthrough; MDX files import components explicitly from `@/components/content/`.
- The site nav (`src/components/Nav.tsx`) is hand-written, not derived from content.

### Layout, styling, HTML safety

- `src/components/layouts/DefaultLayout.tsx` is the only page layout; every page wraps its content in it (`Hero`, `heroHeader`, `heroSubheader`, `simple` props). Root layout in `src/app/layout.tsx` imports `src/styles/main.scss`.
- Styles are à-la-carte Bootstrap 4.6 SCSS partials plus per-feature partials in `src/styles/`; markup uses Bootstrap classes and a custom `prose` class. Legacy Sass `@import` deprecations are silenced in `next.config.mjs`.
- All HTML from external sources goes through `src/util/sanitizeCmsData.ts` (`sanitizeHtml` / `sanitizeCmsData`); `src/util/markdown.server.ts` deliberately uses this instead of rehype-sanitize so there is one allowlist.
- The `.server.ts` suffix marks server-only modules (a Remix holdover); it is a naming convention, not enforced.

### Netlify

- `netlify/functions/join-coffee.ts` and `join-slack.ts` are redirect functions (env: `ZOOM_TUESDAYS`, `ZOOM_THURSDAYS`, `SLACK_JOIN_LINK`); `netlify/edge-functions/block-bots.js` returns 401 to AI-scraper user agents on every path.
- `netlify.toml` holds the legacy 301 map, the `/join-*` rewrites, a `/bots/*` proxy to a Cloudflare Worker, and the Plausible analytics proxy. Add new URL redirects there, not in Next config.

## Content conventions

- Monthly challenges: prose lives in `src/app/monthlychallenges/page.tsx` (`challengeList`) plus one static page per month under `src/app/monthlychallenges/(challenges)/<mon-year>/`. Follow the process in the VC Community Building Resources "Monthly Challenge Technical Guidelines" linked from the README.
- Member emoji must be standard Unicode; maintainers reject PRs otherwise.
- PRs should link an issue (`Closes #123`); the PR template asks for Description and Methodology sections.
