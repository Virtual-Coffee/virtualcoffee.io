# Error monitoring with Sentry

## Context

A broken deploy — a page throwing at render, a server action failing, a client
component crashing — was only noticed when a visitor reported it, and a failure
the code catches is quieter still: `deliver()` turns every sender error into a
History row, so a wrong GitHub App client ID stopped Lunch & Learn issues on
production unnoticed.

Two things shape the setup. This is a community site with a Code of Conduct
report form, so anything that could forward request contents to a third party
must be off by default rather than opted out of. And it is open source and
deployed from Netlify, so only a build has a Sentry auth token; the repository
cannot hold one.

## Decision

**`@sentry/nextjs`, errors and tracing only.** One init file per runtime
(`src/instrumentation-client.ts`, `sentry.server.config.ts`,
`sentry.edge.config.ts`) dispatched from `src/instrumentation.ts`, plus
`src/app/global-error.tsx` for a root-layout crash. Replay, logs, profiling and
metrics are each a separate quota-and-privacy decision that "is the site
broken" did not need. Sentry is off without `NEXT_PUBLIC_SENTRY_DSN`, like every
external service here, and the DSN is set on every deploy context so a broken
preview is caught before it merges. `environment` is the Netlify deploy
context. A release is the commit SHA with its commits and deploy attached, so
suspect commits work and `Fixes VIRTUALCOFFEE-IO-N` in a commit message resolves
the issue.

**No PII: every runtime passes the one restrictive `dataCollection`** from
`src/sentryDataCollection.ts`, and a test pins it. The SDK collects cookies,
headers, bodies and user info whenever `dataCollection` is unset, so leaving it
out is the permissive choice. Sentry sees stack traces, breadcrumbs, route
names and the browser's `User-Agent` (kept because Sentry derives browser and
OS tags and its crawler filters from it), not IP addresses, cookies, other
headers or bodies. The cost is no IP-derived geography; the alternative was a
CoC reporter's address in a third-party tool.

**Handled failures a maintainer must act on go through `reportHandled()`**
(`src/lib/monitoring/reportHandled.ts`), tagged `reported: handled`. Two kinds
of site call use it: live-mode `deliver()` failures that someone has to fix (an
HTTP 4xx other than 429, an unset env var, a rejected webhook), and catches
that strand what someone typed or lose a History line. A 429, a 5xx or a
timeout is the other side's weather and History already records it; a sender
marks any other failure nobody has to fix `report: false`. Everything else
stays a log line, and Sentry's default alerts do the notifying. What it sends
is a scrubbed copy: emails masked as the Captured log masks them, a failed
query's SQL without its params, a Postgres error reduced to its code,
constraint and table, a thrown non-Error replaced rather than serialised.

**Server stack traces keep local variables, except where they could hold PII.**
`withoutPiiFrameVars` deletes frame variables from `reported: handled` events
(the SDK captures locals for caught exceptions too) and from any event under a
route in `PII_ROUTES` (`src/sentryDataCollection.ts`). Filtering by variable
name was rejected because the bundler renames locals.

**Trace sampling is modest in production**, enough for route timings on a
low-traffic site without a bot wave burning the quota.

**Browser noise from code we don't ship is tagged, not dropped.** The build
marks our bundles and `thirdPartyErrorFilterIntegration` tags any event with a
frame outside them `third_party_code:true`, which the default issue view
filters out. Extensions are the bulk of it, but a stack can mix their frames
with ours and a dropped event cannot be looked at later. The one exception is
Netlify's injected RUM beacon, whose ingest request fails whenever a blocker
drops it: never actionable, several a day, so `ignoreErrors` drops it by host.

**Source maps upload from Netlify builds.** `withSentryConfig` needs
`SENTRY_AUTH_TOKEN` in the build environment; without it the upload is skipped
with a warning, so a fork or a local `pnpm build` is unaffected. Browser events
go through the `/monitoring` tunnel, for the same reason `netlify.toml` proxies
Plausible: content blockers drop direct requests.

## Consequences

- CoC report contents, form submissions and visitor identity stay out of
  Sentry only while every `Sentry.init` passes the shared `dataCollection`; an
  init without it, or a loosened baseline, is a policy change, and an SDK major
  can move the defaults again.
- A new form or admin route that handles personal data is added to
  `PII_ROUTES`, or an uncaught throw there ships its locals; the error
  boundaries do not report from those routes because a client-side message can
  quote what was typed.
- A new catch that strands someone's data calls `reportHandled`, and a sender's
  transient failure carries `report: false`, or it pages for nothing.
- `src/app/global-error.tsx` carries its own `<html>`, stylesheet and font, and
  is kept in step with `src/app/layout.tsx` by hand.
- The edge function `netlify/edge-functions/block-bots.ts` and the functions
  under `netlify/functions/` run outside the Next runtime and are not
  instrumented.
