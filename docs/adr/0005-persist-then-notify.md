# Inbound submissions persist first, then notify

A public form's server action writes the row to Postgres, commits, and _then_
posts to Slack. A notification failure is recorded as a `notification_failed`
event and surfaced in `/admin`; it never rolls the submission back and never
propagates to the person who filled the form in.

This is the opposite of the rule in `CLAUDE.md` for admin actions, which says to
**send first and only then write the status change**. That rule is not wrong —
it exists because an admin action emails a real applicant, and writing first
then failing to send leaves a status change nobody was told about, while
retrying double-emails them. There, the email is the risky, unrepeatable half.

Inbound submissions invert every part of that:

- The submission is the irreplaceable thing. Nobody re-types a Code of Conduct
  report because Slack was unreachable.
- The notification is repeatable. A maintainer can be told late, or told twice,
  and nothing is harmed.
- The person submitting cannot fix a Slack outage, so failing their submission
  to preserve ordering would discard data to no purpose.

So the ordering follows the risk: commit the thing that cannot be recovered,
then attempt the thing that can be retried.

The failure mode this accepts is a submission that exists but was never
announced. That is why `notification_failed` is a first-class event type rather
than a log line, and why the warning appears both on the `/admin` dashboard —
where it is seen on arrival — and inside the affected section. The redundancy is
deliberate: a banner only helps someone already looking, and the whole point is
the case where nobody knows to look.

**Do not "fix" the ordering to match the admin-action rule.** It will read like
a bug, which is why this file exists.
