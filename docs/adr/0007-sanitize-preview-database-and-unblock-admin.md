# Sanitize preview database branches, then unblock /admin on previews

0001 noted, as a selling point, that Netlify gives every deploy preview an
isolated database branch "seeded from production." `adminAccess.ts` then had
to turn that selling point into a guard: `/admin` 404s unconditionally on
every deploy preview, because that seeded branch carries real applicants'
emails and personal writing, CoC report contents, and real maintainers' Slack
OAuth tokens, behind a preview URL that is public and shareable. Reviewing an
`/admin` change meant doing it locally against 12 hand-written rows from
`scripts/seedDev.ts` — nothing close to production shape or volume.

## The approach

`db:sanitize-preview` (`scripts/sanitizePreviewDb.ts`) runs as the last step
of every build (`netlify.toml`). It is a no-op unless `CONTEXT` is
`deploy-preview` or `branch-deploy`, and refuses outright if `CONTEXT` is
`production`. When it does run, it replaces every PII/free-text column across
the membership pipeline, the volunteer roster and the four submission tables
with deterministic Faker output (identity values such as Slack member ids are
hashed with a salt generated per run, so a fake is consistent across tables
within one sanitize but cannot be recomputed by someone who knows the real id),
nulls Better Auth's OAuth secrets, deletes session/verification/invite-token
rows, and repoints any CoC attachment at one shared placeholder blob (attachments live in Netlify Blobs, a store shared globally rather than
branched per deploy like the database is — a SQL scrub can't reach them, so
the row has to stop pointing at the real one instead).

`PREVIEW_ADMIN_BYPASS=true` (off by default, same shape as the existing
`ADMIN_DEV_BYPASS`) then lets `adminRoutesEnabled()` serve `/admin` on a
preview instead of 404ing. This is a real trade-off, made deliberately: it
turns every preview URL into a standing admin session for anyone holding the
link. It is only acceptable because the data behind it is no longer real.

## Fail closed via the build, not a runtime check

An alternative design queries a "sanitization complete" marker on every
`/admin` request, so a build that silently sanitized nothing still fails
closed at request time. We didn't build that. Instead the sanitize script
verifies its own work — re-querying every table it touched and asserting
nothing still looks real (every email ends in `@preview.invalid`, no OAuth
secret survives, no attachment key other than the placeholder) — and exits
non-zero if any of that fails. A non-zero exit fails the whole Netlify build,
so a preview that didn't get sanitized never publishes, and `/admin` is
never reachable on it regardless of `PREVIEW_ADMIN_BYPASS`. Simpler than a
per-request database round trip, at the cost of depending on the build step
never succeeding while silently leaving bad data — which is exactly what the
verification pass exists to rule out.

## What this doesn't fix

The real CoC attachments are never deleted — they still sit in the shared
Blobs store under their original keys, just no longer referenced by any
sanitized `coc_report` row. That's an existing property of production access
to that store, not something a preview-focused change should be reaching
into.

Whether Netlify's own automatic migration step for deploy previews runs
before or after our custom build command is not documented anywhere we could
find. The sanitize script depends on the schema already existing by the time
it runs; if that ordering ever turns out to be the other way round, the
script will simply fail (and fail the build) rather than silently doing
nothing — but it was worth spiking on a real PR before relying on it, and is
worth re-checking if Netlify ever changes the build lifecycle.

## Every new table has to be added to it

The script is an allowlist of things it knows to scrub, not a rule that catches
new columns, so a table added later is published in full until somebody
remembers this file. That has already happened twice: `pending_grant` shipped
after this ADR and carried real Slack display names, handles and member ids to
every preview URL, and `user.slack_user_id` was left behind while
`account.account_id` beside it was rewritten. Both were fixed when Volunteer
Invites added `volunteer` and `volunteer_invite_ledger` — the latter records
`Invited {name} <{email}>` in its `body`, which is about as direct a leak as
this codebase has.

Slack member ids are rewritten through one shared derivation, because the same
id joins `user`, `pending_grant`, `volunteer`, `volunteer_invite_ledger` and
`invite`. Faking each occurrence separately would leave a preview whose
volunteers have no balances and no invites — a broken `/admin` rather than a
sanitized one.
