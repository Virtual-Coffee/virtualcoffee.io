# Netlify Database for the membership pipeline

## Context

We are retiring Airtable (0004). The membership pipeline needs a relational
store with a UI we control, and the site is a Next.js SSR app deployed on
Netlify. Every deploy preview needs a database it can write to without
touching production data.

## Decision

**Netlify Database** (Postgres). `@netlify/database` provisions it
automatically and gives every deploy preview an isolated branch forked from
production, so there are no connection strings to manage and no separate
dashboard. Because that fork carries real data, every preview branch is
sanitized before it publishes (0007).

**The ORM is Drizzle v1**, pinned to an exact release candidate rather than the
`0.45` line npm tags `latest`. Netlify's own Drizzle guide says to install
`drizzle-orm@rc` with `@netlify/database`, because v1 ships the first-party
`drizzle-orm/netlify-db` adapter that picks the Postgres driver by runtime. An
RC on the production data path is acceptable while three things hold, and the
choice should be revisited if any stops:

- Netlify recommends it, and the adapter is theirs to maintain.
- Better Auth declares `>=1.0.0-rc.1 <2.0.0` as a supported peer, so the auth
  adapter is sanctioned, not tolerated.
- This codebase uses none of the APIs v1 broke: no relational queries, no
  reliance on global `casing`, no `drizzle-zod`.

The version is pinned without a caret so Renovate proposes each RC bump as a
reviewable diff.

### Migrations

**drizzle-kit owns migrations end to end, and we apply them ourselves.**
`pnpm db:generate --name=<hyphenated-slug>` writes
`drizzle/<YYYYMMDDHHmmss>_<slug>/migration.sql` plus the `snapshot.json` the
next `generate` diffs against — both committed, neither hand-edited. The
Netlify build runs `pnpm db:migrate:deploy` (`drizzle-kit migrate`) after
`next build` and before the preview sanitizer, on every deploy context; locally
`pnpm db:migrate` does the same through `scripts/with-local-netlify.ts`, and the
`db` test project applies the same folders with drizzle's migrator. The ledger
is `drizzle.__drizzle_migrations`.

Netlify's own migration step (anything under `netlify/database/migrations/`)
is deliberately not used. It runs _after_ the build command, which is too late
for the sanitizer: on a fresh branch the sanitizer would see production's
schema and either miss new tables or fail on them. Netlify's docs support
choosing your own migration system and applying it in the build command, and
the constraint is the same either way: production has no publish hook, so a
migration runs while the previous deploy is still live and must be
backwards-compatible with it.

## Considered options

**Cloudflare D1**, explored in #1521, where a maintainer had converted four
form submissions and the events list. Reaching D1 from this site means the
`vinext`/Cloudflare rewrite of #1522 (merged and reverted the same day), and
the spike predates Netlify offering a database at all. `/bots/*` still proxies
to a Cloudflare Worker; this decision is about the membership data, not about
removing Cloudflare from the stack.

## Consequences

- **Never edit a migration that has already deployed.** Generate a new one.
- A branch database whose schema was applied under a different ledger, or by
  hand, is deleted on the Netlify website rather than repaired — the CLI cannot
  — so the next deploy re-forks it from production and replays the migrations
  from the baseline.
- `@netlify/database` reads `NETLIFY_DB_URL`; one-off scripts run outside the
  Netlify runtime and pass `DATABASE_URL` instead (`scripts/with-local-netlify.ts`,
  which refuses anything non-local).
