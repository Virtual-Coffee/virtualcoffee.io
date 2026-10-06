# Error monitoring with Sentry

## Context

The site had no error monitoring. A broken deploy — a page throwing at
render, a server action failing, a client component crashing — was only
noticed when a visitor reported it. Nothing before Netlify's deploy preview
exercises prerendering, and nothing after it watches production.

A failure the code catches is quieter still. `deliver()` turns every sender
error into a History row, so a wrong GitHub App client ID stopped Lunch &
Learn issues on production and nobody found out until someone looked.

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
agree; locally it is `development`.

**A release is the commit SHA, with its commits and deploys attached.** The
build plugin detects the SHA from git, attaches the commits since the previous
release, and registers the Netlify deploy against it under the same context
name. With Sentry's GitHub App installed on the `Virtual-Coffee` org that
gives suspect commits, stack frames that link to GitHub, and `Fixes
VIRTUALCOFFEE-IO-N` in a commit message resolving the issue when it lands.

**No PII: every runtime passes one restrictive `dataCollection`.** From v11
the SDK collects cookies, headers, request and response bodies and user info
whenever `dataCollection` is unset, so leaving it out is the permissive
choice. `src/sentryDataCollection.ts` holds the baseline all three init files
import (no user info, cookies, bodies, database or queue data, no response
headers, request headers limited to `User-Agent`, IP- and secret-bearing query
params denied: `code`, `invite`, `state`), and a test pins its values. Sentry therefore sees stack traces,
breadcrumbs, route names and the browser's `User-Agent`, not IP addresses,
cookies, referrers, other headers or request bodies. `User-Agent` stays
because Sentry derives browser and OS tags and its crawler and legacy-browser
inbound filters from it. The cost is no IP-derived geography on
issues; the alternative was a CoC reporter's address in a third-party tool.

**Handled failures a maintainer must act on are reported too.**
`reportHandled()` (`src/lib/monitoring/reportHandled.ts`) captures a caught
error tagged `reported: handled` and an `area`. Only two kinds of site call
it. One is `deliver()`, in live mode only: when a sender throws an HTTP 4xx
other than 429 or an error with no status at all, and when a sender returns a
failure that is `definitelyNotSent` (an unset env var, a rejected webhook),
reported from its message. A 429, a 5xx or a timeout is the other side's
weather, and History already records it. A sender marks a returned failure
nobody has to fix `report: false`: Slack's 429 and 5xx, a calendar edit race
or a deleted Event, a mail server rejecting the address someone typed. The
other is a catch that strands
what someone typed (a form row, an Invite, a CoC attachment), or a Pending
Grant claim, or loses a History line. Everything else stays a log line.
Sentry's default issue alerts are what notify; nothing extra is configured.

**What `reportHandled` sends is a scrubbed copy.** It keeps the message and
stack with every email address masked as the Captured log masks it. A failed
query keeps its SQL and loses its params, which are form input. A Postgres
error is reduced to `code`, `constraint` and `table` (as context), so its
`detail` and `where` never leave. A thrown non-Error is replaced, not
serialised. Tags name the outbound kind and the masked target, never a body.

**Server stack traces keep local variables, except where they could hold
PII.** `includeLocalVariables` stays on with `stackFrameVariables: true`, for
readable server errors. The server's `beforeSend` (`withoutPiiFrameVars` in
`src/sentryDataCollection.ts`) deletes every frame's `vars` from an event
tagged `reported: handled`, since the SDK captures locals for caught
exceptions as well, and from any event whose request path or transaction is
under a route in `PII_ROUTES`: `/admin`, `/join`, `/invites` and the four
public forms. Filtering by variable name was rejected because the bundler
renames locals. The edge runtime has no local variables to strip.

**Traces are sampled at 25% in production, 100% in development.** Enough to
see route timings on a low-traffic site without a bot wave burning the quota.
Spans stream to Sentry as they finish (the v11 default) rather than being
buffered per transaction; nothing here hooks `beforeSendTransaction` or
`ignoreTransactions`, which that model no longer runs.

**Browser noise from code we don't ship is tagged, not dropped.** The build
marks our bundles with an `applicationKey` and `thirdPartyErrorFilterIntegration`
tags any event with a frame outside them `third_party_code:true`; the default
issue view filters that tag out. Extensions and injected scripts are the bulk
of it, but a stack can mix their frames with ours, and a dropped event can't be
looked at later. The one exception is Netlify's injected RUM beacon, whose
ingest request fails whenever a blocker drops it: fully identified, never
actionable, and several a day, so `ignoreErrors` drops it by host.

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

- CoC report contents, form submissions and visitor identity stay out of
  Sentry only while every `Sentry.init` passes the shared `dataCollection`.
  An init without it, or a loosened baseline, is a policy change, not a
  config tweak; the pinning test fails on the second.
- An SDK major can move these defaults again: read the data-collection
  section of its migration guide before bumping.
- Adding a signal (replay, logs, profiling) is a change to the relevant init
  file and a fresh look at quota and privacy; it is not blocked by anything
  here.
- `src/app/global-error.tsx` carries its own `<html>`, stylesheet and font and
  has to be kept in step with `src/app/layout.tsx` by hand.
- Neither `src/app/error.tsx` nor `src/app/admin/(protected)/error.tsx`
  reports from a `PII_ROUTES` path (a client-side message can quote what was
  typed); server errors there are captured by `onRequestError`.
- A new form or admin route that handles personal data needs adding to
  `PII_ROUTES`; until it is, an uncaught throw there ships its locals.
- A new catch that strands someone's data should call `reportHandled`, or the
  failure is only a log line again.
- A sender's new `definitelyNotSent` failure is reported by default; one that
  is transient or someone else's mistake needs `report: false`, or it pages
  for nothing.
- Netlify holds two new env vars: `NEXT_PUBLIC_SENTRY_DSN` (all contexts) and
  `SENTRY_AUTH_TOKEN` (build secret). Rotating the token is a Netlify change
  only.
- A rejection from the RUM beacon's ingest host is never reported, including
  one that is somehow ours. Anything else with a foreign frame is still
  collected and counts toward quota.
- The Deno edge function `netlify/edge-functions/block-bots.ts` and the
  Netlify functions under `netlify/functions/` are outside the Next runtime
  and are not instrumented.
