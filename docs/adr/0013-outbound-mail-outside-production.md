# Outbound mail and notifications outside production are captured

## Context

The membership pipeline emails real people: Coffee invites, welcomes, Slack
invites. Inbound Submissions post to real Slack channels and open real GitHub
issues. Deploy previews run against a fork of production's database, nothing
scrubbed (docs/adr/0007), so every address a preview could email is a real
applicant's, and Netlify hands the same environment variables to every context
unless someone remembers to scope them. A laptop `.env` with the SMTP
credentials is one wrong click from an applicant's inbox.

The options were: rely on scoping the secrets per context; refuse to send when
credentials are present outside production; or decide delivery per context in
code. Refusing would make every preview walkthrough of an approve or invite
exercise only the failure path — refunds, "nothing was emailed" — never the one
that matters.

## Decision

`src/lib/outbound.ts` decides the **Delivery Mode** for anything the site
sends, and it decides on `CONTEXT` alone:

- **Live** only when `CONTEXT=production`.
- Otherwise email is **Captured**: `sendEmail` writes the whole message to the
  function log and returns `ok: true` with a warning naming the deploy, so the
  status change, the `email_sent` event and the notice the maintainer sees are
  exactly what production would do. The credentials are not read at all.
- The Captured sink is the function log: the `netlify dev` terminal locally,
  the deploy's function log on a preview. Netlify shows that log to site team
  members only — the same people who can read every environment variable,
  including `SLACK_JOIN_LINK`, and the preview's copy of the database. The
  body goes in whole, invite links included, on purpose: a walkthrough checks
  what would have been sent and follows the link. Logging metadata alone would
  be Refusing with a friendlier return value, which is the option this
  decision rejected. `capture()` in `outbound.ts` is the one place that writes
  it, so every sender logs the same way.
- `EMAIL_REDIRECT_TO=<address>` turns Captured into **Redirected**: delivered
  for real, to that one address, with the intended recipient in the subject
  and an `X-Original-To` header and no cc. Production ignores it.
- Slack posts and GitHub issues are Captured on the same rule, opted out of by
  `NOTIFY_LIVE_OUTSIDE_PRODUCTION=true` — they have no address to redirect to,
  so the opt-in pairs with per-context webhook and App values that point at a
  test channel or repository. The capture check runs before the "credentials
  missing" check so a preview without webhooks is quiet rather than a wall of
  `notification_failed` events.

Scoping the secrets in Netlify is still done, as belt and braces. It is not the
mechanism.

## Consequences

- No deploy preview or local checkout can reach an inbox or a channel without
  someone setting a variable whose name says what it does.
- A captured send looks like success in `/admin`, on purpose. The panel shows
  a "captured on this deploy" notice so a reviewer knows why nothing arrived.
- Testing real delivery from a preview means setting `EMAIL_REDIRECT_TO` on
  that branch's context and reading one inbox.
- A captured message on a preview names a real applicant, address and all,
  and is visible to the whole Netlify team for as long as Netlify keeps
  function logs. That audience already has the preview's database and
  `/admin` (docs/adr/0007), so the log adds no one; it is still one more copy
  of the address, which is why nothing about capture is opt-in.
- Anything new that sends outward goes through `outbound.ts` first. A sender
  that checks its own credentials before the mode is the bug this file exists
  to prevent.
