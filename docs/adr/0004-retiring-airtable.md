# Retiring Airtable: the monthly challenge data

Airtable held two kinds of data for this site: the four public form
submissions, and the monthly challenge entries that the challenge pages
counted and listed. This record covers the second. (The numbering leaves room
for the membership-database records that precede it.)

**The challenge data became committed JSON, not a live fetch.** Every
challenge that read Airtable is finished — the newest entry is from November
2024 — so there is nothing to keep in sync. `src/data/podcast/episodes.json`
had already established the pattern. A reader expecting challenge data to
come from somewhere live will find this surprising, which is why it is written
down: the data is frozen, the pages are better off static, and any storage
with a sync step for immutable 2021–2024 leaderboards would be machinery with
no purpose. `scripts/airtable/snapshotChallenges.ts` reads through the same
views the old fetches used, so the snapshot contains exactly the rows the site
rendered; it is kept for provenance rather than because it needs re-running.

`PUBLIC_AIRTABLE_API_KEY` is no longer read at build or request time. A build
no longer depends on Airtable being reachable, and the pages no longer have an
"empty data" fallback to fall into.

## What is deliberately left

- `netlify.toml` still redirects `/member-survey` to an Airtable-hosted form.
  It is a config redirect with no code behind it and a separate maintainer
  workflow; replacing it is its own piece of work.
- The November 2023 and 2024 challenge pages still link out to the Airtable
  entry form ("once you've published your content, submit it here"). Those
  challenges are over, so the links are stale content rather than a live
  dependency — but archiving the Monthly Challenges base will break them, and
  rewriting finished challenge prose is an editorial call, not a migration one.
- The form submissions still write to Airtable through `src/util/airtable/`;
  moving them is separate work.
