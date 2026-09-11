# Netlify Database for the membership pipeline

We are retiring Airtable. The membership pipeline needs a relational store with
a UI we control, and the site is a Next.js SSR app deployed on Netlify.
We chose **Netlify Database** (Postgres): `@netlify/database` provisions it
automatically, gives every deploy preview an isolated branch seeded from
production, and applies SQL migrations from `netlify/database/migrations/` on
deploy — so there are no connection strings to manage and no separate dashboard.

## Considered options

**Cloudflare D1**, explored in issue #1521 ("Research Spike: Evaluate
Cloudflare's Utility"), where a maintainer had already converted four form
submissions and the events list to D1. Reaching D1 from this site means the
`vinext`/Cloudflare rewrite of PR #1522, which was merged and reverted the same
day by #1523. That spike predates Netlify shipping a database offering, and the
platform question it was answering no longer has the same answer.

The `/bots/*` path still proxies to a Cloudflare Worker (`vc-bots`), and that
stays where it is. This decision is about the membership data, not about
removing Cloudflare from the stack.

## Amendment (2026-09-10): Drizzle v1 and the shared migration directory

The ORM is Drizzle, and as of this amendment it is Drizzle **v1**, pinned to an
exact release candidate rather than the `0.45` line that npm still tags
`latest`. Netlify's own Drizzle guide now says to install `drizzle-orm@rc` with
`@netlify/database`, because v1 ships a first-party `drizzle-orm/netlify-db`
adapter that picks the Postgres driver by runtime — the thing `src/db/index.ts`
was hand-rolling.

An RC on the production data path is acceptable here for three reasons, and
the decision should be revisited if any of them stops holding:

- Netlify recommends it, and the adapter is theirs to maintain.
- Better Auth already declares `>=1.0.0-rc.1 <2.0.0` as a supported peer, so
  the auth adapter is sanctioned, not tolerated.
- This codebase uses none of the APIs v1 actually broke: no relational queries
  (the whole of RQB v1 was removed), no reliance on global `casing` (every
  column names itself), no `drizzle-zod`.

The version is pinned exactly, without a caret, so Renovate proposes each RC
bump as a reviewable diff instead of the lockfile drifting on its own.

**The migration directory is shared.** Before v1, drizzle-kit wrote
`drizzle/0000_name.sql` plus a journal, Netlify rejected the `0000` prefix as
"out of order", and `scripts/syncMigrations.ts` existed to restamp and copy each
file into `netlify/database/migrations/`. v1 removed the journal and now names
each migration `<YYYYMMDDHHmmss>_<name>/migration.sql` — Netlify's layout —
so `out` points straight at `netlify/database/migrations/` and the script is
gone. Two consequences that look odd without this context:

- Each folder also carries a `snapshot.json`. That is drizzle-kit's diff base
  for the next `generate`; it is committed, and Netlify ignores it (verified by
  applying a migration locally with the file present).
- `generate` must always be given `--name=<hyphenated-slug>`. drizzle's
  auto-generated names use underscores, and Netlify's slug rule is lowercase
  alphanumerics and hyphens only.

The seven migrations that had accumulated on the feature branch were squashed
into a single baseline at the same time. None of them had reached production —
`main` had no `netlify/database/migrations/` at all — so the "never edit a
deployed migration" rule did not bind. The one database that _had_ run the
old seven was the branch's deploy-preview database, and that has to be deleted
by hand (on the Netlify website; the CLI cannot) before the next preview
deploy, so it is re-created from production and replays the baseline from an
empty schema. Netlify's applier passes the baseline's newer timestamp straight
through onto a populated schema otherwise, and fails on the first
`CREATE TYPE`.
