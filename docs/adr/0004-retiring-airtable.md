# Retiring Airtable

Airtable held four things for this site: the membership base (moved in
0001), the four public form submissions, the monthly challenge data, and — the
part that was easy to miss — the notifications that told maintainers any of it
had arrived.

**The form submissions moved to Netlify Database.** One typed table per kind
rather than one polymorphic table: a CoC Report and a Volunteer Signup share
almost no fields, and CoC needs its own table so its access can be narrowed
independently of the rest. Status and history are new; Airtable tracked neither.

**The challenge data became committed JSON, not tables.** Every challenge that
read Airtable is finished — the newest entry is from November 2024 — so there is
nothing to keep in sync. `src/data/podcast/episodes.json` had already
established the pattern. A reader expecting "all data lives in Netlify DB" will
find this surprising, which is why it is written down: the data is frozen, the
pages are better off static, and tables plus migrations for immutable 2021–2024
leaderboards would be machinery with no purpose.
`scripts/airtable/snapshotChallenges.ts` reads through the same views the old
fetches used, so the snapshot contains exactly the rows the site rendered.

**The notifications had to be rebuilt.** Four deployed Airtable automations
posted to Slack on every new record, and the Lunch & Learn one also opened an
assigned GitHub issue in `Virtual-Coffee/VC-Community-Docs`. None of this
appeared anywhere in the codebase. Moving the data without moving these would
have made CoC violation reports land silently — the single worst outcome
available in this change. They are now incoming webhooks and a GitHub App call,
keeping the original destinations and wording.

**All 79 historical submissions came across**, keyed on `airtable_record_id` so
the import is idempotent. They import as `new` rather than `resolved`: Airtable
recorded no status at all, so claiming they were handled would assert something
nobody knows — the same reasoning that gives the membership import a `lapsed`
status instead of calling undecided applications `declined`. The cost is that
historical rows show as open work, which is the honest presentation.

## What is deliberately left

- `netlify.toml` still redirects `/member-survey` to an Airtable-hosted form.
  It is a config redirect with no code behind it and a separate maintainer
  workflow; replacing it is its own piece of work.
- The November 2023 and 2024 challenge pages still link out to the Airtable
  entry form ("once you've published your content, submit it here"). Those
  challenges are over, so the links are stale content rather than a live
  dependency — but archiving the Monthly Challenges base will break them, and
  rewriting finished challenge prose is an editorial call, not a migration one.
- `scripts/airtable/importMembership.ts` and `MEMBERSHIP_AIRTABLE_API_KEY`
  stay until the production membership import is confirmed complete. The
  `airtable` dependency stays for the one-off scripts.
- Disabling the four automations and archiving the bases needs base-creator
  rights. Nothing breaks if they stay: the site no longer writes to Airtable,
  so the automations can never fire again.
