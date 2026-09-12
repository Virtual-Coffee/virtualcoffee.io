# Volunteers are matched to Slack by hand, not by algorithm

## Context

The other Airtable imports key on `airtable_record_id` and run unattended. The
volunteer import cannot: everything about an Invite Allowance keys on the
Slack member id (0009), and Airtable has no such field — `member_profiles.SlackID`
is entirely empty. A row has an informal `Name` ("Kirk", "Meg", "Nicky T"), a
`Profile Name` and `Email` through a linked member record, and a
`GitHub Username` missing for 9 of the 91. The join has to be made against the
live Slack directory from a name, a handle and an address, none reliable.

## Decision

`scripts/airtable/importVolunteers.ts` runs in two phases with a maintainer in
between: `--propose` scores candidates and writes a mapping file, a person
reviews every row, and `--apply` writes only what the file says.

### Why not fuzzy matching

A Levenshtein threshold would produce a complete-looking import in one run. A
wrong match credits or debits a real person's allowance and nothing surfaces
it; the volunteer finds a number they did not expect, months later, with no
way to learn why. Where the old system does not actually say something, the
import does not invent it — the same judgement 0004 applied in importing
undecided applications as `lapsed` rather than `declined`.

### What the scoring is for

`--propose` fills `slackUserId` in only where one candidate scores at least 50
and beats every other; everything else arrives blank with up to five scored
candidates and the reasons each matched. The score orders a list a human
reads; it decides nothing. Weights put an identifier above a name, and
normalisation trims and strips punctuation.

**Email is used here.** 0009's rule is about authorisation at sign-in, where a
mismatch grants nothing and reports nothing. This is a one-off migration in
which every row is confirmed by a person before it is written, and ignoring
the highest-signal field would mean more rows resolved by hand for a rule that
does not reach this act. The script says so, so the two do not read as
contradictory.

### The mapping file is not committed

`scripts/airtable/volunteerSlackMapping.json` is gitignored. It pairs real
people's names with Slack member ids; it is not a policy and the site never
reads it, so unlike `src/data/bots.ts` it does not earn a place in git history.
The cost is that the mapping cannot be re-verified from the repository later;
the README says how to regenerate it.

## Consequences

- **An unmapped volunteer is not imported at all.** The roster is keyed on a
  Slack member id and a row without one could not accrue, be linked to an
  account, or have Invites attributed. Getting the unmapped count to zero is
  what the review is for; leaving one blank is an admission that nobody could
  identify that person.
- **Only the 25 active volunteers get a balance and the `volunteer` role.** A
  mapped inactive volunteer is imported paused with no credit and no role, so
  history stays attributable and reactivation is one click. The role is a
  Pending Grant on the Slack member id (0009) through the same helper
  `/admin/volunteers` uses, since almost none of the 91 have signed in.
- Rows with no `Invites Available` value import as zero; absent is not a
  number.
- **Balances arrive as one net `imported` row** dated when Airtable said it.
  There is no history to replay, and this is why 0011's expiry sweep refuses to
  refund an Invite with no `spend` row.
- **Re-running is safe.** Volunteers key on `airtable_record_id` with
  `onConflictDoNothing`, and the balance is written only for a Volunteer with
  no ledger rows at all.
- `importMembership.ts` must run first: this script attributes the Invites
  that one creates, and against an empty `invite` table reports
  `Attributed 0`.
