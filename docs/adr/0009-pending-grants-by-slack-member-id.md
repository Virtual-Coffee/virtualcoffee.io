# Pre-provisioned roles are keyed on the Slack member id

## Context

Granting `/admin` access required the person to have signed in once, because
`/admin/user-management` picked from existing `user` rows. Onboarding a
maintainer was two conversations: ask them to sign in, wait, then grant.

## Decision

A **Pending Grant** is a Role assigned to a Slack member id before that person
has ever signed in, held in `pending_grant` and applied the first time they
do.

### Not the email address

Email is the obvious key — it is on the `user` row — and the wrong one. A
match on email is a match on _the address Slack happens to return_ against
_what a maintainer typed_; when they disagree nothing errors, the grant just
silently never applies, which is the worst failure mode available for an
authorization feature.

The Slack member id has none of that. Better Auth's Slack provider already
uses it as the account subject
(`accountSubject: ({ profile }) => profile['https://slack.com/user_id']`), so
it is exactly what lands in `account.account_id`, and it is immutable, which a
handle is not. For the same reason bootstrap access is `ADMIN_BOOTSTRAP_SLACK_IDS`,
not an email list — "Copy member ID" is two clicks in Slack.

### The claim happens in `account.create.after`

`role` is set in `databaseHooks.user.create.before`, where the Slack member id
does not exist yet — the user row is written before the account row. Mapping
it off the profile in `mapProfileToUser` is not an option: Better Auth's
`additionalFields` reference says `input: true` user fields accept values from
API input _and_ `mapProfileToUser`, and `input: false` ones accept neither. A
column that decides which Pending Grant matches a user cannot be writable by
that user's own `updateUser` call, so `slackUserId` is `input: false` and
`claimPendingGrant()` writes it directly through Drizzle from
`databaseHooks.account.create.after` — the first point at which both ids
exist.

`claimPendingGrant()` never throws. A failed claim must not fail sign-in, for
the same reason `notifySlack` never throws (0005): the person cannot fix it,
and locking them out is worse than letting them in with nothing.

### `user.slack_user_id` duplicates `account.account_id`

Deliberately. Every question this feature asks — "does this Slack member
already have an account?", "whose grant is this?" — becomes a single-table
lookup on a unique, indexed column instead of a join against `account`
filtered by `provider_id`. `claimPendingGrant()` writes it on every Slack
sign-in, grant or no grant.

### Roles still live in `user.role`

`pending_grant.role` is not a second source of truth for a live session:
nothing in `sessionCan()` consults it, and a Grant only matters for a user
that does not exist yet. On claim the Grant's roles are copied onto
`user.role`, the Grant is stamped `claimed_at`, and `user.role` is
authoritative from then on. Claimed Grants are kept — they record who
pre-provisioned whom, and the User Management table reads the grantor and
date off them. An _unclaimed_ Grant that is withdrawn is hard-deleted, because
it never took effect.

The unique index is partial — one unclaimed Grant per Slack member, any number
of claimed ones — so someone whose `user` row was deleted can be granted
access again without colliding with their own history.

### The picker needs a bot token

`users.list` needs `users:read` on a bot token; the OAuth credentials that
sign maintainers in request only `openid`, `profile` and `email`.
`SLACK_BOT_TOKEN` is therefore a separate credential, and
`src/data/slackMembers.ts` follows the mock gate every other source in
`src/data/` uses.

## Consequences

- **Matching is never on email**, anywhere in the grant path.
- A failed claim strands the person with no roles; `listAccessRows()` lists
  anyone holding nothing whose Slack id matches an unclaimed Grant, badged
  **Grant not applied**, so it is visible rather than silent.
- There is no backfill of `user.slack_user_id`: the baseline migration creates
  `user`, `account` and the column together. If a user ever predates it, the
  "already signed in?" check answers _no_ for them and a maintainer could
  create a Grant that can never be claimed.
