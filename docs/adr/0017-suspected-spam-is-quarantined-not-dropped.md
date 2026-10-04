# Suspected spam is quarantined, not dropped

## Context

`/join` has three bot defences: the honeypot and signed render timestamp in
`src/util/forms/spamGuard.ts`, and the per-IP edge rate limit. A bot that
renders the page in a real browser, waits, and submits a few times a day passes
all three. Every such submission became a `waitlisted` Application, a post in
#admin, and one more in the "waiting on a first decision" count.

The bots share a signature in what they type: a single random mixed-case name
token and a Gmail address with dots scattered through the local part. A check
on content catches them, but a content check can misfire on a real person, and
the honeypot's answer to a failure — redirect to the thank-you page and write
nothing — would lose that person without anyone seeing it.

## Decision

`submit()` runs `suspectSpam()` (`src/util/forms/spamHeuristics.ts`) on the
name and email. A match is written as an Application with status
`suspected_spam` and a `flagged_as_spam` event naming the signal. It is not
announced in Slack; the next real announcement's footer counts it instead. The
applicant sees the ordinary thank-you page, and a resubmission from a
quarantined address writes nothing.

`suspected_spam` is a status, in a third list (`QUARANTINE_STATUSES`) beside
the queue and archive lists, not a flag column. A flag would be a second axis
the lifecycle module does not own, and every queue query would have to
remember to filter it. As a status it is a transition like any other: a human
releases it to `waitlisted`, keeping `submittedAt` as its place in the queue,
or declines it through `close()`, which sends no email.

An application that redeemed a Claim Link skips the check. A Volunteer vouched
for that person, and quarantining it would spend their Invite while hiding the
application.

Only `/join` runs the check. The other public forms have no quarantine status,
so for them a match could only mean dropping the submission.

## Consequences

- A false positive costs a reviewer a click on `/admin/waitlist/suspected-spam`
  and costs the applicant nothing. Some will happen — an initials-only address
  such as `j.r.r@` trips the email signal — and the heuristic is tuned against
  that cost rather than to zero.
- The heuristic matches today's bots. When they change pattern, change
  `spamHeuristics.ts`; a challenge such as Cloudflare Turnstile is the step
  after that, and does not need our DNS moved.
- Persist-then-notify (`docs/adr/0005`) still holds: the quarantined row is
  committed; only the notification is withheld.
