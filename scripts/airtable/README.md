# Airtable scripts

The one-off scripts that carried this site off Airtable. None of them run
in a build or in CI, and nothing on the site reads Airtable at runtime any more.
They are kept for provenance, for re-verification, and because the production
membership import is not yet confirmed complete.

`docs/adr/0004-retiring-airtable.md` records why each destination was chosen —
typed tables per submission kind, committed JSON for the challenges, `lapsed`
rather than `declined`. This file is only about running them.

| Script                  | Reads                                                  | Writes                                                                                                                        | Key                           | Wrapper        |
| ----------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------------- |
| `importMembership.ts`   | base `appGHm8ztVWug6UxH`: `membership_form`, `Invites` | `membership_application`, `invite`, `application_event`                                                                       | `MEMBERSHIP_AIRTABLE_API_KEY` | yes            |
| `importVolunteers.ts`   | base `appGHm8ztVWug6UxH`: `Volunteers`                 | `volunteer`, `volunteer_invite_ledger`, `user.role`, `pending_grant`                                                          | `MEMBERSHIP_AIRTABLE_API_KEY` | `--apply` only |
| `importSubmissions.ts`  | base `appZ4d2Q9K0IepQnA`: four tables                  | `volunteer_signup`, `coc_report`, `lunch_and_learn_idea`, `coffee_table_group_request`, `submission_event`, `coc-attachments` | `FORMS_AIRTABLE_API_KEY`      | yes            |
| `snapshotChallenges.ts` | bases `appJStQemmYeoRcox`, `app10kd5ewHiLTjxn`         | five JSON files in `src/data/monthlyChallenges/data/`                                                                         | `PUBLIC_AIRTABLE_API_KEY`     | no             |

## Before you run anything

**The keys are read-only tokens, one per base — ask a maintainer.** Nothing here
writes back to Airtable.

**These scripts do not read `.env`.** There is no `dotenv` anywhere in
`scripts/`, so a key sitting in `.env` is invisible to them and you get
`…_AIRTABLE_API_KEY is not set` with no hint why. Put the key on the command
line, as every example below does, or export it first:

```bash
set -a; source .env; set +a
```

**Anything that writes to Postgres goes through the wrapper.**
`scripts/with-local-netlify.ts` asks the Netlify CLI for the local connection
string, refuses anything that is not `localhost`/`127.0.0.1`, and starts a
Netlify Blobs server over `netlify dev`'s own sandbox directory. So:

- `netlify dev` must already be running in another terminal (`pnpm dev`), with
  `pnpm db:migrate` applied once.
- Run from the repo root.
- Without it, an import gets no database and no blob store.

## `importMembership.ts`

Imports the membership base. Invites first, so `from_invite_id` on each
application can be resolved to the new `invite.id`.

Airtable carried application state in three loose flags; the script translates
them into the status enum:

| Airtable                     | Status           |
| ---------------------------- | ---------------- |
| `approved`                   | `member`         |
| `On Waiting List`            | `waitlisted`     |
| pulled off the queue, recent | `coffee_invited` |
| pulled off the queue, stale  | `lapsed`         |
| never queued, never approved | `lapsed`         |

`lapsed` is deliberately not `declined`: roughly 1,378 of these rows are people
nobody ever made a decision about, and recording that as a rejection would be
false.

**Flags**

- `--dry-run` — classify, print the cohort tables, write nothing.
- `--cutoff-days=N` — default `180`. Applications pulled off the waitlist longer
  ago than this import as `lapsed` rather than `coffee_invited`. **The `=` is
  required**; `--cutoff-days 90` is silently ignored and you get 180. A value
  that is not a positive number exits 1.

**Running it.** A dry run never constructs the database connection, so it needs
no wrapper and no `netlify dev`:

```bash
MEMBERSHIP_AIRTABLE_API_KEY=… \
  pnpm exec tsx scripts/airtable/importMembership.ts --dry-run
```

A real run does:

```bash
MEMBERSHIP_AIRTABLE_API_KEY=… pnpm exec tsx scripts/with-local-netlify.ts \
  tsx scripts/airtable/importMembership.ts
```

**Reading the dry run.** At the default cutoff it prints its counts next to a
snapshot taken from Airtable on 2026-09-05 — `member` 1099, `waitlisted` 7,
`coffee_invited` 63, `lapsed` 1378 — and flags the drift. Some drift is
expected: people keep joining the waitlist, and every day moves a few more rows
past the cutoff. A large difference means the classification has diverged from
what Airtable means, and is worth understanding before importing. At any other
cutoff the comparison is suppressed, since the numbers no longer apply.

**Re-running.** Both tables key on a unique `airtable_record_id` and insert with
`onConflictDoNothing`, so a re-run inserts only what is missing and reports
`N already present`. Two things follow from that being a skip and not an update:

- **A different `--cutoff-days` reclassifies nothing already imported.** The
  cutoff only affects rows on the run that first inserts them.
- **A re-run after a partial failure keeps application→invite links.** The
  Airtable-id → invite-id map is built from every invite in the database, not
  just the ones this run inserted, so applications written on the second run
  still resolve their `invite_id`.

**Data quirks worth knowing.** `approved_at` is null for 553 of the 1,099
approved rows — it postdates them — so absence of the timestamp says nothing
about approval. The old form required the code-of-conduct checkbox in the browser
but never reliably stored it, so `agreed_to_coc_at` is set only where Airtable
happened to capture it. Attendance was never recorded, so `coffee_attended_at`
is always null.

**Production is not documented.** The wrapper refuses a non-local connection
string on purpose, so there is no supported path here for importing into the
production database. Doing it is a deliberate maintainer decision that has not
been made — see "What is deliberately left" in `docs/adr/0004-retiring-airtable.md`.

## `importVolunteers.ts`

Imports the 91 rows of the `Volunteers` table: who may give out Invites, what
they had left, and which historical Invites were theirs.

**The hard part is identity, and it needs a human.** Everything about an Invite
Allowance is keyed on the Slack member id (`docs/adr/0009`), and Airtable holds
no Slack ids at all — `member_profiles.SlackID` exists and is entirely empty. So
the join has to be made from a name, a GitHub username and an email against the
live Slack directory, and it will not be clean: 9 of the 91 rows have no GitHub
link, the names are informal ("Kirk", "Meg", "Nicky T"), and one username ends
in a space. A wrong match credits or debits a real person's allowance and does
it invisibly, so nothing is guessed. See `docs/adr/0012`.

It therefore runs in two phases with a review in between:

```bash
# 1. read Airtable and Slack, score every candidate, write the mapping file
MEMBERSHIP_AIRTABLE_API_KEY=… SLACK_BOT_TOKEN=xoxb-… \
  pnpm exec tsx scripts/airtable/importVolunteers.ts --propose

# 2. open scripts/airtable/volunteerSlackMapping.json and check every row

# 3. see what would be written
pnpm exec tsx scripts/with-local-netlify.ts \
  tsx scripts/airtable/importVolunteers.ts --apply --dry-run

# 4. write it
pnpm exec tsx scripts/with-local-netlify.ts \
  tsx scripts/airtable/importVolunteers.ts --apply
```

`--propose` needs no database and no wrapper. `--apply` writes to Postgres, so
it goes through the wrapper like the other imports.

**The mapping file is gitignored on purpose.** It pairs real names with Slack
member ids, and it is a working artefact of one migration rather than something
the site reads. `--propose` overwrites it, so do not re-run that after editing.

**`slackUserId` is the only field you edit.** `--propose` fills it in where one
candidate scores at least 50 and beats every other; everything else arrives
blank with up to five scored `candidates` beside it for reference. **Leaving it
blank is a valid answer** — that volunteer is skipped, and their Invites keep
`inviter_name` and stay unattributed, which is the honest result rather than a
guess. Two rows mapped to the same Slack member abort the run before anything
is written.

**Only active volunteers get a balance.** Airtable has 91 volunteers and only 25
`Active`. A mapped inactive volunteer is imported paused, with no credit: their
history stays attributable and reactivating them is one click in
`/admin/volunteers`, but they do not arrive holding invites. **An unmapped row
is not imported at all** — the roster is keyed on a Slack member id, so there is
nothing to key it on. The point of reviewing the file is to get that number to
zero. The 12 rows with no `Invites Available` value at
all import as zero — absent is not a number, and all twelve are recent.

**Only active volunteers get the `volunteer` role.** The row alone would accrue
Invites its owner cannot reach, so an active volunteer is also granted the role
— directly on their user if they have signed in, otherwise as a Pending Grant
that `claimPendingGrant()` applies at first sign-in (`docs/adr/0009`, `0010`),
with `Airtable import` as the grantor. Paused volunteers arrive with no role,
exactly as pausing in `/admin/volunteers` leaves someone.

**Balances arrive as one net row**, not a reconstruction. Airtable's number is a
running balance with no history behind it (the grants were manual, +5 at a time,
and unrecorded), so there is nothing to replay. One `imported` ledger row saying
what Airtable said is the honest version of a number nobody can explain further.

**Re-running is safe.** Volunteers key on `airtable_record_id` and insert with
`onConflictDoNothing`; the balance is only written for a Volunteer with no
ledger rows at all, because an append-only ledger would otherwise double every
balance on a second run. The role is merged into whatever a person already
holds rather than duplicated, so a second run also backfills grants for rows an
earlier run imported.

Run `importMembership.ts` **first**. This script attributes Invites that script
creates; with an empty `invite` table it will report `Attributed 0`.

## `importSubmissions.ts`

Imports the four public form tables — 79 rows in total — one Postgres table per
kind, each inserted row also getting an `imported` row in `submission_event`.

**Flag:** `--dry-run` only.

```bash
# dry run: fetches everything, including the attachments, and writes nothing —
# no database or blob store, so no wrapper
FORMS_AIRTABLE_API_KEY=… pnpm exec tsx scripts/airtable/importSubmissions.ts --dry-run

# real run
FORMS_AIRTABLE_API_KEY=… pnpm exec tsx scripts/with-local-netlify.ts \
  tsx scripts/airtable/importSubmissions.ts
```

It closes with a `found / expected / inserted` table. The expected column is
what was in Airtable on 2026-09-09 — Volunteer Form 50, CoC Violation Reports
18, Lunch and Learn Idea 9, New Coffee Table Group 2 — and a `*` marks any count
that has drifted since.

**Everything imports as `new`, not `resolved`.** Airtable tracked no status at
all, so the historical rows show up as open work in `/admin`. That is the honest
presentation rather than a bug; ADR 0004 explains it.

**Dates come from `import_created_at`, not Airtable's `createdTime`.** Most rows
share a bulk `createdTime` of 2024-09-25 from an earlier migration off Netlify
Forms, so preferring it would misdate almost every historical row. `Lunch and
Learn Idea` has no `import_created_at` and falls back to `createdTime`; it is
also the one table whose Airtable fields are TitleCase rather than lower_snake.

**The four CoC attachments.** Four reports carry a JSON blob in `uploadedFiles`
— not an Airtable attachment array — pointing at `d33wubrfki0l68.cloudfront.net`,
Netlify's legacy asset CDN. Those URLs still resolve, so the files are fetched
and stored in the `coc-attachments` blob store rather than left as dead links,
with the content type sniffed from the leading bytes.

- A **dry run** still fetches them, to prove the URLs resolve, but writes
  nothing — so it needs no blob store.
- A **real run** checks the store before importing anything and aborts if it is
  unreachable. That preflight exists because the per-file error handling would
  otherwise report a missing configuration as four skipped attachments and still
  exit 0 — a config mistake dressed up as a dead URL.
- Under the wrapper the files land in the **local** sandbox store, in the same
  directory `netlify dev` serves, so the local site can serve them from
  `/admin/submissions/coc/[id]/attachment`.
- To write to the **production** store instead — which is what the real
  migration needs — set `NETLIFY_SITE_ID` and `NETLIFY_AUTH_TOKEN`. Those
  override the wrapper's local store, so do not set them for a local run.

A per-file failure is a warning, not a fatal error: the report text matters far
more than the screenshot. A row whose fetch failed still records the original
filename with no blob key.

## `snapshotChallenges.ts`

Writes the five JSON files the monthly challenge pages read. Touches no
database, so it needs no wrapper:

```bash
PUBLIC_AIRTABLE_API_KEY=… pnpm exec tsx scripts/airtable/snapshotChallenges.ts
```

Those files are committed, so the check after a re-run is `git diff` — **an empty
diff is the expected result.** Output is deterministic: a fixed field order per
snapshot, tab-indented, with empty values dropped. A diff means either Airtable
changed or the committed snapshot has drifted.

**The view names are load-bearing.** The script reads through the same views the
old runtime fetches used, so the snapshot holds exactly the rows the site
rendered — a view can filter out rows a plain table read would include, and the
2023 and 2024 NaNoWriMo cohorts come from one `NaNoWriMo` table and are
distinguishable _only_ by view.

| File                            | Table                     | View                             |
| ------------------------------- | ------------------------- | -------------------------------- |
| `member-articles.json`          | `Member Articles`         | _(whole table)_                  |
| `hacktoberfest-2022-repos.json` | `Hacktoberfest2022 Repos` | `Default`                        |
| `nanowrimo-2023.json`           | `NaNoWriMo`               | `NaNoWriMo 2023`                 |
| `nanowrimo-2024.json`           | `NaNoWriMo`               | `NaNoWriMo 2024`                 |
| `pairing-challenge-2023.json`   | `Pairing Challenge`       | `2023 Pairing Challenge Results` |

2023 is the last year a pairing-challenge results view exists. The old
`getTotalPairingSessions()` built that view name from the current year, so it had
been asking for a nonexistent view since 1 January 2024.

## If the bases are ever archived

Archiving needs base-creator rights, and nothing on the site breaks when it
happens — but every script here stops working, and two pieces of content still
point at Airtable: the `/member-survey` redirect in `netlify.toml`, and the entry
links on the November 2023 and 2024 challenge pages. See ADR 0004.

## Shared modules

`classify.ts` (how an Airtable membership row maps onto an application status)
and `match.ts` (scoring a volunteer against the Slack directory) sit beside the
scripts so they can be imported without running an import: each script executes
`main()` on load. Their tests are the `*.test.ts` files next to them.
