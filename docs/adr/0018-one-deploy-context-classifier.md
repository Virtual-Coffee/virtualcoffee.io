# One deploy-context classifier

## Context

Nine places read Netlify's `CONTEXT` and decided for themselves what it meant:
outbound delivery, the admin dev bypass, the admin banner, `siteUrl()`, the
analytics tag, two scripts, the mock gate and the edge function. They disagreed
about a value none of them listed. The dev bypass treated an unknown context as
local and signed in without Slack; outbound delivery treated it as a deploy
and captured with a masked log line.

## Decision

- `src/lib/deployContext.ts` is the only reader. `classify()` maps `CONTEXT` to
  `production`, `preview` or `local`: `production` is production; unset, empty
  and `dev` (`netlify dev`) are local; **anything else is a preview**.
- Unknown means preview because the safe error is the stricter one: a preview
  captures and masks, refuses the dev bypass and takes its own origin.
- `contextLabel()` is the raw value for log lines and the admin banner.
- The module has no imports, so the edge function bundles it for Deno
  (imported with an explicit `.ts` extension, like `src/data/bots.ts`).
- `next.config.mjs` still inlines the raw `CONTEXT` (docs/adr/0007), and
  Sentry's sample rates stay on `NODE_ENV`.

## Consequences

- A new Netlify context needs no code change: it is a preview.
- The dev bypass is refused on a context it does not recognise, where it was
  allowed before.
- A new reader of `CONTEXT` is a review finding: use `deployContext()`.
