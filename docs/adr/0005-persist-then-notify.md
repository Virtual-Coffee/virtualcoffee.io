# Inbound submissions persist first, then notify

## Context

Admin actions follow a **send first, then write** rule: an action emails a real
applicant, and writing first then failing to send leaves a status change nobody
was told about, while retrying double-emails them. There, the email is the
risky, unrepeatable half. Inbound submissions invert every part of that:

- The submission is the irreplaceable thing. Nobody re-types a Code of Conduct
  report because Slack was unreachable.
- The notification is repeatable. A maintainer can be told late, or twice, and
  nothing is harmed.
- The person submitting cannot fix a Slack outage, so failing their submission
  to preserve ordering would discard data to no purpose.

## Decision

A public form's server action writes the row to Postgres, commits, and _then_
posts to Slack. A notification failure is recorded as a `notification_failed`
event and surfaced in `/admin`; it never rolls the submission back and never
propagates to the person who filled the form in. The ordering follows the
risk: commit the thing that cannot be recovered, then attempt the thing that
can be retried.

## Consequences

- The accepted failure mode is a submission that exists but was never
  announced. `notification_failed` is therefore a first-class event type
  rather than a log line, shown both on the `/admin` dashboard and inside the
  affected section — a banner only helps someone already looking, and the
  point is the case where nobody knows to look.
- **Do not "fix" the ordering to match the admin-action rule.** It reads like
  a bug, which is why this file exists. The `action.db.test.ts` beside each
  form pins it.
