# Slack notifications are Block Kit container blocks

## Context

Every Slack send was a mrkdwn string: five channel posts announcing a new
Submission or Membership Application, and the DM that tells a member they have
been granted access. mrkdwn reads `&`, `<` and `>` as control characters, so a
form field holding `<!channel>` would page the whole channel unless every
value a person typed was escaped first — one `escape()` that every builder had
to remember. A post was a wall of `*Label:* value` lines with a bare link at
the bottom, and a CoC report's reporter and incident details sat open in the
channel for anyone scrolling past.

Four Block Kit layouts were drawn and compared: top-level blocks (header,
section fields, actions), an attachment card, the `card` block, and the
`container` block. The first two cannot hide anything; the `card` block caps
its body at 200 characters and only takes text, so a long field is cut and a
second button lands in the wrong place; the `container` block groups ordinary
blocks under a title, takes a `rich_text` child, and can arrive collapsed.

## Decision

- Every channel post is **one `container` block**: a title, a subtitle where
  there is a natural one-line preview, a `rich_text` block of the row's
  fields, an optional static note, and an `actions` row of link buttons with
  "View in admin" first and primary. The shapes live in `src/lib/slack/blocks.ts`
  and every builder in `notify.ts` is data fed to `notification()`.
- **Anything a person typed is a `rich_text` text run or a `plain_text`
  object**, both of which Slack renders literally. `escape()` is gone because
  nothing typed reaches mrkdwn; mrkdwn is for static copy only, in `context`
  blocks and the DM's one sentence. A subtitle taken from a field is clipped to
  the 150-character `plain_text` cap; the field below keeps the whole value.
- Every post is `is_collapsible`. The **CoC report is `default_collapsed`**
  and its fallback `text` is the title alone, so neither the channel nor a
  push notification shows the reporter or the incident until a reviewer opens
  it. Every other post's `text` is the title and subtitle.
- The two application posts end with a **queue-depth footer** outside the
  container — how many are waiting on a first decision, from the same
  `statusCounts()` the dashboard uses. It is best-effort: a failed read is
  logged and the footer left off, because the row is saved and the
  announcement matters more than the number.
- The **access-grant DM is top-level blocks**, not a container: one sentence
  and one button need no group, and a collapse control would only let a
  member hide the instruction they were sent.
- `ContainerBlock` is declared locally until `@slack/types` ships one
  (`3.1.0` has `card` and `table` but not `container`); every other block type
  comes from `@slack/types`.
- What `deliver()` captures is the **payload JSON**, so the local log shows
  exactly what would have been posted and a deploy's link-only line still
  finds the admin URL (docs/adr/0013).

## Consequences

- A test asserts on what a reviewer sees — `richTextFields()`,
  `buttonLinks()`, `notes()` in `src/test/slack.ts` — not on a string.
- A new notification is a `notification()` call; a new kind of block is a
  change to `blocks.ts`, where the literal-vs-mrkdwn rule is enforced.
- `container` is newer than the SDK's types, so its acceptance by an incoming
  webhook is proven by a live post from a preview (the `NOTIFY_LIVE_OUTSIDE_PRODUCTION`
  opt-in of docs/adr/0013), not by the type checker.
- Slack posts a `block_actions` for a url button as well, and renders a 404
  warning on the button unless the app's Interactivity URL acks it. The
  webhooks belong to the vc-bots Slack app, so every link button carries a
  `website_<id>` `action_id` and vc-bots acks `/^website_/`; a button without
  that ack still opens its page, with the warning beside it.
- `/join` reads the queue count after the insert: one more query on a public
  action, outside the save's try so a slow count can never be reported to the
  applicant as a failure to save.
