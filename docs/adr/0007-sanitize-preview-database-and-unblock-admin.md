# Sanitize preview database branches, then unblock /admin on previews

## Context

Every deploy preview gets a database branch forked from production (0001).
That branch carries real applicants' emails and personal writing, CoC report
contents, and real maintainers' Slack OAuth tokens, behind a preview URL that
is public and shareable. So `/admin` 404s unconditionally on previews, and
reviewing an `/admin` change meant doing it locally against a dozen
hand-written rows from `scripts/seedDev.ts` — nothing close to production
shape or volume.

## Decision

`db:sanitize-preview` (`scripts/sanitizePreviewDb.ts`) runs as the last step
of every build (`netlify.toml`), after `db:migrate:deploy` has brought the
branch up to this commit's schema, so it always sees the migrated schema. It
is a no-op unless `CONTEXT` is `deploy-preview` or `branch-deploy`, and refuses
outright on `production`. When it runs, it replaces every PII and free-text
column across the membership pipeline, the volunteer roster and the four
submission tables with deterministic Faker output, nulls Better Auth's OAuth
secrets, deletes session, verification and invite-token rows, and repoints any
CoC attachment at one shared placeholder blob — attachments live in Netlify
Blobs, a store shared globally rather than branched per deploy, so a SQL scrub
cannot reach them and the row has to stop pointing at the real one instead.

Identity values such as Slack member ids are hashed with a salt generated per
run: a fake is consistent across tables within one sanitize, so joins still
work and volunteers still have balances and invites, but cannot be recomputed
by someone who knows the real id.

`PREVIEW_ADMIN_BYPASS=true` (off by default, same shape as `ADMIN_DEV_BYPASS`)
then lets `adminRoutesEnabled()` serve `/admin` on a preview instead of
404ing. This turns every preview URL into a standing admin session for anyone
holding the link, and is only acceptable because the data behind it is no
longer real.

### Fail closed via the build, not a runtime check

The alternative — querying a "sanitization complete" marker on every `/admin`
request — was not built. Instead the script verifies its own work: it
re-queries every table it touched, asserts nothing still looks real (every
email ends in `@preview.invalid`, no OAuth secret survives, no attachment key
other than the placeholder), and exits non-zero otherwise. A non-zero exit
fails the whole Netlify build, so a preview that did not get sanitized never
publishes and `/admin` is never reachable on it regardless of the flag.

### Coverage is enforced, not remembered

The script is an allowlist of columns it knows to scrub, so a table added
later would publish in full until somebody remembered this file — and that
happened. The verification pass therefore compares `information_schema`
against `SANITIZED_COLUMNS` in `scripts/lib/schemaCoverage.ts`, every column
the script has made a decision about, and a live table or column missing from
the list fails the build exactly as a real email left behind would. The list
is checked the other way too, so a dropped column cannot leave a stale entry.

## Consequences

- **Adding a table or column means adding it to `schemaCoverage.ts`**, which is
  the moment to decide what the sanitizer does with it. `pnpm test` runs the
  same check against the migrated schema, so the build is not the first place
  it fails.
- The real CoC attachments are never deleted — they still sit in the shared
  Blobs store under their original keys, no longer referenced by any sanitized
  row. That is an existing property of production access to that store, not
  something a preview-focused change should reach into.
