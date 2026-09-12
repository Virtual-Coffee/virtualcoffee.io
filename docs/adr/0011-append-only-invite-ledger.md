# The Invite Allowance is a ledger, not a number

Airtable stored a Volunteer's allowance as `Invites Available`, a plain number
field. An automation added five to every active volunteer whenever someone ran
it; the invite form subtracted one. Nothing recorded why the number was what it
was.

`volunteer_invite_ledger` is append-only, and the balance is `SUM(delta)`.

## Why not the number

A stored integer is smaller, faster, and one query. It also cannot answer the
only question anyone actually asks about an allowance, which is "why do I have
four?" — and the Airtable version demonstrates the consequence rather than
theorising about it. Seven volunteers sit at 23, the median active volunteer is
in the teens, and nobody can say how any of those numbers were arrived at. When
we import them we are copying an assertion, not a history.

The ledger makes every movement a row with a reason: a monthly accrual, a spend
against a named Invite, a refund, an admin adjustment with a note. The
volunteer detail screen renders it directly, and that list _is_ the answer.

## The indexes are the design

Two partial unique indexes do the work that would otherwise be careful code:

- one row per Volunteer per month where `reason = 'monthly_accrual'`, keyed on
  `period_key`
- one `spend` per Invite, and at most one refund per Invite

The first is what makes a daily scheduled job safe. The second is what makes
double-spending and double-refunding unrepresentable rather than merely
unlikely.

The refund index was wrong on the first attempt and is worth recording. It was
unique on `(invite_id, reason)`, which permits a `refund_cancelled` _and_ a
`refund_expired` for the same Invite — netting the Volunteer a free invite out
of nothing. The status guards make that hard to reach, but the schema claimed
the database made it impossible and it did not. Grouping both refund reasons
under one index is what actually says "at most once".

Both indexes are partial on a key column, and a unique index says nothing
about a row whose key is NULL: a `spend` with no `invite_id` would be a
charge nothing can refund, and a second one would not be a duplicate. A CHECK
constraint (`volunteer_invite_ledger_reason_keys`) therefore requires
`period_key` on an accrual and `invite_id` on a spend or refund. The code
always set them; the constraint is what makes the indexes mean what this
section claims.

## Accrual is a cron, which Airtable never had

There was no schedule in Airtable at all. `Increase Invites` fired on a manual
trigger and added +5 to everyone active, which is precisely how balances
reached 23. Replacing it with +1 a month is a deliberate change of behaviour,
not a port, and it is the reason a Volunteer can now plan around their
allowance.

The job runs **daily** even though the accrual is monthly, and it is written as
"ensure this month's row exists" rather than "run on the first". A monthly
schedule that missed its window would leave every Volunteer short until somebody
noticed; a daily idempotent one heals itself the next morning. `period_key` plus
the unique index is what lets it be run any number of times, including by hand
from `pnpm invite-maintenance` while testing.

There is **no cap**. A Volunteer who never spends accumulates, which is what
Airtable did and what the community is used to. `deactivated_at` is the check on
it: someone who steps back stops accruing, so the unbounded case is a person who
is actively volunteering and choosing not to invite anyone.

## Sending inverts the "send first, then write" rule

Every other admin action that emails sends first and writes afterwards, because
a failed send that has already changed a status leaves a maintainer unable to
tell what happened. Sending an Invite cannot do that: the Claim Link carries a
token that must exist in the database before the email can be composed.

So the write comes first, and the failure path compensates:

- a send that **definitely** did not deliver cancels the Invite, appends a
  refund, and says nothing was emailed — safe to try again
- a send we **cannot be sure** about leaves it charged and says exactly that,
  because refunding there risks two invitations reaching one person

That is the same discipline `sendEmail`'s `definitelyNotSent` exists to support,
reached from the other direction. It is also a divergence from
`approveMembership`, which does multi-write-plus-email with no transaction and
no rollback at all — that is right there, where the orphan is a single-use token
that expires on its own, and wrong here, where it is a Volunteer's allowance.

The spend itself is taken under `SELECT ... FOR UPDATE` on the Volunteer's row.
The ledger's indexes stop one Invite being charged twice, but two sends started
at once would each charge a _different_ Invite against the same last remaining
allowance, and no index can see that.

## Consequences

- The balance is never read from a column, so every screen that shows it runs a
  sum. At ninety volunteers this is a correlated subquery in one query; it would
  need revisiting at a scale this community is unlikely to reach.
- Nothing may ever `UPDATE` or `DELETE` a ledger row. Corrections are new rows,
  which is why `adjustBalance` requires a reason.
- An Invite imported from Airtable has no `spend` row, because the import brings
  a balance across as a single net figure. The expiry sweep therefore refuses to
  refund any Invite it cannot find a `spend` for — without that guard it would
  invent allowance from history it never charged for.
