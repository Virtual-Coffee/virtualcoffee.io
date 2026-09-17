# Error monitoring with Sentry

## Context

The site had no error monitoring. A broken deploy — a page throwing at
render, a server action failing, a client component crashing — was only
noticed when a visitor reported it. Nothing before Netlify's deploy preview
exercises prerendering, and nothing after it watches production.

Two things about this site shape the setup. It is a community site with a
Code of Conduct violation report form, so anything that could forward request
contents to a third party has to be off by default rather than opted out of.
And it is open source and deployed from Netlify, so a build is the only place
that has a Sentry auth token and the repository cannot hold one.

## Decision

**`@sentry/nextjs` with the SDK's default baseline: errors and tracing.**
Three init files, one per runtime (`src/instrumentation-client.ts`,
`sentry.server.config.ts`, `sentry.edge.config.ts`), dispatched from
`src/instrumentation.ts`, plus `src/app/global-error.tsx` for the case where
the root layout itself throws. Session replay, logs, profiling and metrics are
not enabled; each is a separate decision about quota and privacy and none was
needed to answer "is the site broken."

**The DSN is `NEXT_PUBLIC_SENTRY_DSN` and Sentry is off without it.** This is
the same rule every other external service here follows: the env var is the
switch, and a clone with no `.env` sends nothing. The DSN is not a secret
(Sentry's own position), so the gate is about local noise, not exposure. It is
set on Netlify for every deploy context, not only production — a broken
preview is worth knowing about before it merges, and the preview is also where
the wiring itself gets verified.

**`environment` is the Netlify deploy context.** `next.config.mjs` inlines
`CONTEXT` as `NEXT_PUBLIC_SENTRY_ENVIRONMENT` so the browser and the server
agree; locally it is `development`. `release` is left to the SDK's git
detection, which Netlify's clone satisfies.

**No PII.** `sendDefaultPii` stays at its default and no `dataCollection`
block is passed — the SDK treats even an empty object as opting the unset
categories in. Sentry therefore sees stack traces, breadcrumbs and route
names, not IP addresses, cookies, headers or request bodies. The cost is no
IP-derived geography on issues; the alternative was a CoC reporter's address
in a third-party tool.

**Traces are sampled at 25% in production, 100% in development.** Enough to
see route timings on a low-traffic site without a bot wave burning the quota.

**Source maps upload from Netlify builds and are deleted afterwards.**
`withSentryConfig` wraps the Next config; with Turbopack the upload runs after
the build completes and needs `SENTRY_AUTH_TOKEN` in Netlify's build
environment. Without the token the build still succeeds — the upload is
skipped with a warning — so a fork or a local `pnpm build` is unaffected.

**Browser events go through `/monitoring`.** `tunnelRoute` adds a rewrite so
the SDK posts to the site rather than to `sentry.io`, for the same reason
`netlify.toml` proxies Plausible: content blockers drop direct requests and
the client-side half of the picture disappears.

## Consequences

- A new external service must not be reported to: CoC report contents, form
  submissions and visitor identity stay out of Sentry unless someone passes
  `dataCollection` or `sendDefaultPii`. Reviewers should treat either as a
  policy change, not a config tweak.
- Adding a signal (replay, logs, profiling) is a change to the relevant init
  file and a fresh look at quota and privacy; it is not blocked by anything
  here.
- `src/app/global-error.tsx` carries its own `<html>`, stylesheet and font and
  has to be kept in step with `src/app/layout.tsx` by hand.
- Netlify holds two new env vars: `NEXT_PUBLIC_SENTRY_DSN` (all contexts) and
  `SENTRY_AUTH_TOKEN` (build secret). Rotating the token is a Netlify change
  only.
- The Deno edge function `netlify/edge-functions/block-bots.ts` is outside the
  Next runtime and is not instrumented.
