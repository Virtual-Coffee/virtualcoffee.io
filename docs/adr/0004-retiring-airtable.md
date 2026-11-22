# Retiring Airtable

## Context

Airtable held four things for this site: the membership base (moved in 0001),
the four kinds of Submission, the monthly challenge data, and the
notifications that told maintainers any of it had arrived — four deployed
automations that posted to Slack on every new record, one of which also opened
an assigned GitHub issue in `Virtual-Coffee/VC-Community-Docs`. None of that
last part appeared anywhere in the codebase.

## Decision

**The Submissions moved to Netlify Database**, one typed table per kind
rather than one polymorphic table: a CoC Report and a Volunteer Signup share
almost no fields, and CoC needs its own table so its access can be narrowed
independently of the rest (0006). Status and history are new; Airtable tracked
neither.

**The challenge data became committed JSON, not tables.** Every challenge that
read Airtable is finished, so there
is nothing to keep in sync, and `src/data/podcast/episodes.json` had already
established the pattern. Tables plus migrations for immutable 2021–2024
leaderboards would be machinery with no purpose.
`scripts/airtable/snapshotChallenges.ts` reads through the same views the old
fetches used, so the snapshot contains exactly the rows the site rendered.

**The notifications were rebuilt as incoming webhooks and a GitHub App call**,
keeping the original destinations and wording. Moving the data without them
would have made CoC violation reports land silently — the single worst outcome
available in this change.

**All historical submissions came across**, keyed on `airtable_record_id` so
the import is idempotent. They import as `new` rather than `resolved`: Airtable
recorded no status, so claiming they were handled would assert something
nobody knows — the same reasoning that gives the membership import a `lapsed`
status instead of calling undecided applications `declined`. Historical rows
therefore show as open work, which is the honest presentation.

## Consequences

- The site no longer writes to Airtable, so the old automations can never fire
  again. Archiving the bases does not affect the membership pipeline.
- The import and snapshot scripts, their tokens and the `airtable` dependency
  were removed after the cut-over; see git history before the commit that
  deleted `scripts/airtable/`.
- Historical Submissions show as open work until a reviewer resolves them.
- `netlify.toml` still redirects `/member-survey` to an Airtable-hosted form,
  and the finished challenge pages link out to Airtable entry forms. Those are
  stale content and a separate maintainer workflow, not a live dependency of
  the pipeline; archiving the bases will break them.
