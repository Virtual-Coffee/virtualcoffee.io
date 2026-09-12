# UUIDv7 primary keys, with a separate human reference

## Context

The membership tables started with sequential integer primary keys because
the detail screen shows the number ("Application 1842") and maintainers say it
out loud. The same number was also the URL: `/admin/submissions/coc/42` hands
anyone holding one link the ability to guess its neighbours and discloses how
many reports exist. For CoC reports — the most sensitive rows in the database,
reachable on deploy previews (0007) — a guessable counter is the wrong
identity even setting the URL aside.

## Decision

**Eight tables use `uuid` primary keys generated in the app as UUIDv7**
(`src/db/ids.ts`, the `uuid` package's `v7()`): `invite`,
`membership_application`, `application_event`, the four submission kinds and
`submission_event`. `invite_token` was already `uuid`. Better Auth's tables
keep their `text` ids — Better Auth owns that convention.

**v7 rather than v4** because it is time-ordered: rows insert at the end of the
index instead of scattering through it, and the admin lists — sorted by
`submitted_at` or `created_at`, neither unique — get a deterministic tie-break
by naming the id as a second `orderBy` term.

**Generation is in the app, not a column default.** `$defaultFn` rather than
`DEFAULT gen_random_uuid()`, so there is one source of truth; a SQL default
would have to be v4 and would quietly mint the wrong shape of id for anything
bypassing Drizzle.

**A separate `reference` column keeps the human handle.** Nobody reads
`01997a3f-8c21-7a4b-…` aloud, so the two jobs are two columns: `id` is opaque
and appears in URLs and foreign keys; `reference` is a sequential
`GENERATED ALWAYS AS IDENTITY` integer that only appears on screen.
`membership_application` and the four submission kinds have one; the two
event-log tables do not, because their ids are never shown. Imports insert
oldest-first so references count up with age, and they gap when rows are
deleted, as a reference number should.

## Consequences

- **`reference` must never appear in a URL.** It is the guessable one.
- The leading 48 bits of a v7 id are a millisecond timestamp, so an id you
  already hold reveals roughly when its row was created — a much smaller
  disclosure than a counter. It also means a truncated id is useless as a
  display value: rows created in the same few hours share a long prefix.
- Postgres raises `22P02` on a malformed literal compared against a `uuid`
  column, so an unchecked route param makes the query throw instead of
  matching nothing. **Every route reading an id from the URL passes it through
  `isId()` first**; a 404 depends on that.
- A further change to these key types after deployment means a forward
  migration that converts live primary keys and backfills every foreign key.
