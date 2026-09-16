# Outbound mail and notifications outside production are captured

## Context

The membership pipeline emails real people: Coffee invites, welcomes, Slack
invites. Inbound Submissions post to real Slack channels and open real GitHub
issues. Deploy previews get a copy of production's database, real applicants
included (docs/adr/0007), and Netlify hands the same environment variables to
every context unless someone remembers to scope them. A laptop `.env` with the
SMTP credentials is one wrong click from an applicant's inbox.

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
  the deploy's function log on a preview. Locally the whole message goes in,
  body included — the local database is seeded, and reading what would have
  been sent is the point. On a deploy the message is to a real applicant and
  Netlify keeps the log after the walkthrough, so `capture()` writes only what
  a walkthrough needs: the recipient masked (`a•••@example.test`), the
  subject or channel, and every link in the body — an invite link is how a
  reviewer follows the flow, and its code is a secret, not a person. Never
  the body. `capture()` in `outbound.ts` is the one place that writes it, so
  every sender logs the same way.
- `SMTP_HOST=<host>` (with an optional `SMTP_PORT`, default `1025`) turns
  Captured into **Local**: delivered for real, addressed exactly as production
  would address it, to a local-only SMTP sink such as
  [Mailpit](https://mailpit.axllent.org/). No Google credentials are read, and
  nothing leaves the machine. Only a checkout (`CONTEXT=dev` or none) honours
  it; production and every Netlify deploy ignore it, because on a deploy the
  same variable would name a host that real applicants' mail can reach.
- There is no "redirect everything to one inbox" mode. It existed while
  preview data was fake; against real applicants it would deliver their mail,
  addressed by name, to whoever set a variable.
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
- Testing real delivery happens locally, with no credentials: run a local
  SMTP sink and set `SMTP_HOST`. A preview cannot deliver anywhere, whatever
  variables it is given.
- A captured line is visible to the Netlify site team for as long as Netlify
  keeps function logs. On a deploy it names nobody; the links it carries are
  single-use and expire.
- Anything new that sends outward goes through `outbound.ts` first. A sender
  that checks its own credentials before the mode is the bug this file exists
  to prevent.
