# Volunteers are matched to Slack by hand, not by algorithm

The other three Airtable imports key on `airtable_record_id` and run
unattended. The volunteer import cannot, because the thing it has to produce —
a Slack member id — does not exist anywhere in Airtable.

`scripts/airtable/importVolunteers.ts` runs in two phases with a maintainer in
between: `--propose` scores candidates and writes a mapping file, a person
reviews every row, and `--apply` writes only what the file says.

## There is nothing to join on

Everything about an Invite Allowance keys on the Slack member id, for the
reasons 0009 gives. Airtable's `Volunteers` table has no such field.
`member_profiles.SlackID` exists elsewhere in the base and is **entirely
empty** — zero rows on `isNotEmpty`.

What it does have, per row: a `Name` that is informal ("Kirk", "Meg", "Nicky
T"), a `Profile Name` and `Email` looked up through a linked member record, and
a `GitHub Username` that is missing for 9 of the 91. One of those usernames ends
in a space.

So the join has to be made against the live Slack directory from a name, a
handle and an address, none of which is reliable and one of which — the email —
0009 explicitly forbids for access matching.

## Why not fuzzy matching

A Levenshtein threshold would produce a complete-looking import in one run. The
failure mode is what rules it out: a wrong match credits or debits a real
person's allowance, and nothing anywhere surfaces it. The volunteer simply finds
a number they did not expect, months later, with no way to find out why.

This is the same judgement 0004 made in importing 1,378 undecided applications
as `lapsed` rather than `declined`. Where the old system does not actually say
something, the import does not invent it. An unmatched volunteer is skipped;
their Invites keep `inviter_name` and stay unattributed, which is visibly
incomplete rather than invisibly wrong.

## What the scoring is for

`--propose` scores every Slack member against every volunteer and fills
`slackUserId` in only where one candidate scores at least 50 and beats every
other. Everything else arrives blank with up to five scored candidates beside
it, each carrying the reasons it matched.

The score orders a list a human reads. It decides nothing. Weights put an
identifier above a name — two people can share "Meg", but a GitHub handle is
close to unique — and normalisation trims and strips punctuation, which is what
catches the trailing space.

**On the email.** 0009's rule is about authorisation at sign-in, where the
address is whatever Slack happens to return for someone and a mismatch fails
silently, granting nothing and reporting nothing. This is a one-off migration in
which every row is confirmed by a person before it is written. Ignoring the
highest-signal field available would mean more ambiguous rows resolved by hand,
for a rule that does not reach this act. The distinction is written into the
script so the two do not read as contradictory.

## The mapping file is not committed

`scripts/airtable/volunteerSlackMapping.json` is gitignored. It pairs real
people's names with Slack member ids, and unlike `src/data/bots.ts` — committed
precisely so that policy changes arrive as reviewable diffs — it is not a policy
and the site never reads it. It is a working artefact of one migration.

The cost is that the mapping cannot be re-verified from the repository later. In
exchange, a file of names and identifiers does not live in git history forever.
The README says how to regenerate it.

## What arrives, and what does not

**Only the 25 active volunteers get a balance.** A mapped inactive volunteer is
still imported, so history stays attributable and reactivating them is one
click, but they arrive paused with no credit.

**Only the active volunteers get the `volunteer` role, too.** A `volunteer` row
is half of a Volunteer (0010): the role is what lets them into `/invites`, and
almost none of the 91 have signed in, so it is written as a Pending Grant on the
Slack member id (0009) through the same helper `/admin/volunteers` uses. A
paused volunteer arrives the way pausing leaves someone — with no role — and
gets it back on reactivation.

**An unmapped volunteer is not imported at all.** The roster is keyed on a Slack
member id and there is nothing else to key it on: a row with none could not
accrue, could not be linked to an account, and could not have Invites
attributed to it — a name in a list and nothing more. Getting the unmapped count
to zero is what the review is for, and leaving one blank is an admission that
nobody could identify that person, not a shortcut.

**The 12 rows with no `Invites Available` value import as zero.** Absent is not
a number, and all twelve were created recently enough never to have been granted
anything.

**Balances arrive as one net `imported` row.** Airtable's figure is a running
balance whose grants were manual, +5 at a time, and unrecorded — there is no
history to replay. A single row saying what Airtable said, on the date it said
it, is the honest version of a number nobody can explain further. It is also why
0011's expiry sweep refuses to refund an Invite with no `spend` row: the
imported Invites were never charged against this ledger.

**Re-running is safe.** Volunteers key on `airtable_record_id` with
`onConflictDoNothing`, and the balance is written only for a Volunteer with no
ledger rows at all — an append-only ledger would otherwise double every balance
on a second run.

`importMembership.ts` must run first. This script attributes the Invites that
one creates; against an empty `invite` table it reports `Attributed 0` and is
otherwise fine.
