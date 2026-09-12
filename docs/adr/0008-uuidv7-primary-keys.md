# UUIDv7 primary keys, with a separate human reference

0001 gave the membership pipeline sequential integer primary keys, and the
comment on `membership_application.id` defended the choice: the detail screen
shows the number ("Application 1842") and maintainers say it out loud. That
reasoning was about the screen. It missed that the same number is also the URL.

`/admin/submissions/coc/42` hands anyone holding one link the ability to guess
its neighbours, and discloses roughly how many reports exist. For CoC reports
that is the worst version of the problem — the rows are the most sensitive in
the database, and `/admin` is reachable on deploy previews (0007). A guessable
counter is the wrong identity for this data even setting the URL aside.

**Eight tables moved to `uuid` primary keys, generated in the app as UUIDv7**
(`src/db/ids.ts`, the `uuid` package's `v7()`): `invite`,
`membership_application`, `application_event`, the four submission kinds and
`submission_event`. `invite_token` was already `uuid` with `gen_random_uuid()`,
so the pattern was in the schema before this change. Better Auth's tables keep
their `text` ids — Better Auth owns that convention.

**v7 rather than v4** because it is time-ordered: rows insert at the end of the
index instead of scattering through it, and the admin lists — which sort by
`submitted_at` and `created_at`, neither of which is unique — get a
deterministic tie-break for free. Those `orderBy` calls now name the id as a
second term, which they could not usefully have done before.

The cost is real and accepted: the leading 48 bits of a v7 id are a millisecond
timestamp, so an id you already hold reveals roughly when its row was created.
That is a much smaller disclosure than a counter. The remaining 74 random bits
are what make the id unguessable, which is the property the URLs needed. It also
means a truncated id is useless as a display value — rows created in the same few
hours share a long leading prefix.

**Generation is in the app, not a column default.** `$defaultFn` rather than
`DEFAULT gen_random_uuid()`, so there is one source of truth. A SQL default would
have to be v4, and would quietly mint the wrong shape of id for anything
bypassing Drizzle rather than failing.

## The reference column

Dropping the number would have cost maintainers the handle they actually use, and
a uuid cannot replace it — nobody reads `01997a3f-8c21-7a4b-…` aloud. So the two
jobs are now two columns: `id` is opaque and appears in URLs and foreign keys,
and `reference` is a sequential `GENERATED ALWAYS AS IDENTITY` integer that only
appears on screen. `membership_application` and the four submission kinds have
one; the two event-log tables do not, because their ids are never shown.

**`reference` must never appear in a URL.** It is the guessable one, and putting
it in a route would reintroduce exactly the problem this change removes. It is
visible only to maintainers, who can already see the volume it discloses.

Both imports now insert oldest-first so the references count up with age rather
than following Airtable's fetch order. References gap when rows are deleted,
since an identity sequence does not recycle — that is the intended behaviour for
a reference number.

## Why this was cheap to do now

Nothing had shipped: PR #1551 was still open, `main` carried no `src/db/` at all,
and the production database branch was empty. So the three existing migrations
were deleted and regenerated as one, rather than adding an `ALTER` that converts
live primary keys and backfills every foreign key. **After this deploys, that
option is gone** — a further change to these key types means a forward migration.

The one guard worth remembering: Postgres raises `22P02` on a malformed literal
compared against a `uuid` column, so an unchecked route param makes the query
throw instead of matching nothing. Every route reading an id from the URL passes
it through `isId()` first, and a 404 depends on that.
