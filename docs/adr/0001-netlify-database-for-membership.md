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
