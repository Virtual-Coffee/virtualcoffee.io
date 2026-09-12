# The Invite Allowance is a ledger, not a number

## Context

Airtable stored a Volunteer's allowance as `Invites Available`, a plain number.
A manually triggered automation added five to every active volunteer whenever
someone ran it; the invite form subtracted one. Nothing recorded why the number
was what it was: seven volunteers sit at 23, and nobody can say how.

## Decision

`volunteer_invite_ledger` is append-only, and the balance is `SUM(delta)`.
Every movement is a row with a reason — a monthly accrual, a spend against a
named Invite, a refund, an admin adjustment with a note — and the volunteer
detail screen renders that list as the answer to "why do I have four?".

### The indexes are the design

Two partial unique indexes do the work that would otherwise be careful code:

- one row per Volunteer per month where `reason = 'monthly_accrual'`, keyed on
  `period_key` — what makes a daily scheduled job safe to rerun
- one `spend` per Invite, and at most one refund per Invite, with both refund
  reasons under one index so a `refund_cancelled` _and_ a `refund_expired`
  cannot net a free invite — what makes double-spending unrepresentable rather
  than unlikely

A unique index says nothing about a row whose key is NULL, so the CHECK
constraint `volunteer_invite_ledger_reason_keys` requires `period_key` on an
accrual and `invite_id` on a spend or refund. The code always sets them; the
constraint is what makes the indexes mean what this section claims.

### Accrual is a daily, idempotent cron

+1 a month replaces Airtable's manual +5, a deliberate change of behaviour
that lets a Volunteer plan around their allowance. The job runs **daily** as
"ensure this month's row exists" rather than "run on the first": a monthly
schedule that missed its window would leave everyone short until somebody
noticed, a daily idempotent one heals itself the next morning, and
`pnpm invite-maintenance` can run it by hand any number of times.

There is **no cap**; `deactivated_at` is the check on it. Someone who steps
back stops accruing, so the unbounded case is a person actively volunteering
and choosing not to invite anyone.

### Sending inverts the "send first, then write" rule

The Claim Link carries a token that must exist in the database before the
email can be composed, so the write comes first and the failure path
compensates: a send that **definitely** did not deliver cancels the Invite,
appends a refund and says nothing was emailed; a send we **cannot be sure**
about leaves it charged and says exactly that, because refunding there risks
two invitations reaching one person. That is `sendEmail`'s `definitelyNotSent`
discipline reached from the other direction.

The spend is taken under `SELECT … FOR UPDATE` on the Volunteer's row. The
indexes stop one Invite being charged twice, but two sends started at once
would each charge a _different_ Invite against the same last allowance, and no
index can see that.

## Consequences

- **Nothing may ever `UPDATE` or `DELETE` a ledger row.** Corrections are new
  rows, which is why `adjustBalance` requires a reason.
- The balance is never read from a column, so every screen that shows it runs
  a sum — a correlated subquery at ninety volunteers, worth revisiting at a
  scale this community is unlikely to reach.
- An Invite imported from Airtable has no `spend` row, because the import
  brings a balance across as one net figure (0012). The expiry sweep therefore
  refuses to refund any Invite it cannot find a `spend` for.
