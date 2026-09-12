# Pre-provisioned roles are keyed on the Slack member id

Giving someone admin access used to require them to sign in first. `/admin/user-management`
picked from people who already had a `user` row, and said so out loud: _"Only
people who have signed in at least once can be granted access."_ Onboarding a
maintainer was therefore two conversations — ask them to sign in, wait, then go
and grant.

A **Pending Grant** is a Role assigned to a Slack member id before that person
has ever signed in, held in `pending_grant` and applied the first time they do.

## Not the email address

The obvious key is the email: it is right there on the `user` row, and
`ADMIN_BOOTSTRAP_EMAILS` already worked that way. It is the wrong one.

A match on email is a match on _the address Slack happens to return for that
person_, against _what a maintainer typed_. Those agree until someone signs in
with a different address than the one they are known by, and when they disagree
nothing errors — the grant just silently never applies, which is the worst
failure mode available for an authorization feature.

The Slack member id has none of that. Better Auth's Slack provider already uses
it as the account subject:

```js
accountSubject: ({ profile }) => profile['https://slack.com/user_id'];
```

so it is exactly what lands in `account.account_id`, and matching on it is
matching on the thing the sign-in actually carries. It is also immutable, which
a handle is not.

`ADMIN_BOOTSTRAP_EMAILS` is replaced by `ADMIN_BOOTSTRAP_SLACK_IDS` rather than
kept alongside. Its original comment argued that a maintainer knows their own
email and would have to go digging for the other — true, but "Copy member ID" is
two clicks in Slack, and keeping an email-matching path would have left the one
mechanism this ADR exists to remove.

## The claim happens in `account.create.after`

`role` has always been set in `databaseHooks.user.create.before`. A Pending Grant
cannot be resolved there, because the Slack member id does not exist yet — the
user row is written before the account row.

The tempting fix is to map it off the profile in `mapProfileToUser` and read it
in the user hook. Better Auth does not allow that for a field we would want to be
server-owned. From its `additionalFields` reference:

> `input`: Whether Better Auth accepts the field when creating or updating a
> record (default: `true`). **For user fields, this includes values from API
> input and `mapProfileToUser`.** Set this to `false` for server-owned fields
> such as `role`.

So `slackUserId` is either writable by `mapProfileToUser` _and_ by the client's
own `updateUser` call, or by neither. Letting a signed-in user rewrite the column
that decides which Pending Grant matches them is not a trade worth making for one
saved write, so the field is `input: false` and `claimPendingGrant()` writes it
directly through Drizzle from `databaseHooks.account.create.after` — the first
point at which both the user id and the Slack member id exist.

`claimPendingGrant()` never throws. A failed claim must not fail sign-in, for the
same reason `notifySlack` never throws (0005): the person cannot fix it, and
locking them out is worse than letting them in with nothing. The cost is that a
failure strands them — they hold no roles, so the picker refuses them as already
signed in, and a table of role-holders would not list them either.
`listAccessRows()` closes that: it also returns anyone holding nothing whose
Slack id matches an unclaimed Grant, badged **Grant not applied**.

## `user.slack_user_id` duplicates `account.account_id`

Deliberately. Every question this feature asks — "does this Slack member already
have an account?", "whose grant is this?" — becomes a single-table lookup on a
unique, indexed column instead of a join against `account` filtered by
`provider_id`.

`claimPendingGrant()` writes it on every Slack sign-in, grant or no grant, so
it is never `NULL` for anyone who has signed in since the column existed. There
is no backfill: the baseline migration creates `user`, `account` and this column
together, so no user predates it. If that ever changes, the "already signed in?"
check answers _no_ for every unbackfilled user — which would let a maintainer
create a grant that can never be claimed, for someone who already has access.

## Roles now live in two places, briefly

0006 said roles live comma-separated in `user.role`, and that is still where
authorization reads them. `pending_grant.role` is not a second source of truth
for a live session: nothing in `sessionCan()` consults it, and a Grant only ever
matters for a user that does not exist yet.

The relationship is one-way and terminal. On claim, the Grant's roles are copied
onto `user.role`, the Grant is stamped `claimed_at`, and `user.role` is
authoritative from then on. Claimed Grants are kept rather than deleted — they
are the record of who pre-provisioned whom, and the User Management table reads
the grantor and the date off them, so "Granted" means the same thing whether
access was pre-provisioned or set after the fact. An _unclaimed_ Grant that is
withdrawn is hard-deleted, because it never took effect.

The unique index is partial — one unclaimed Grant per Slack member, any number of
claimed ones. A plain unique constraint would mean someone whose `user` row was
deleted could never be granted access again, because their own claimed history
would collide with the new Grant.

## The picker needs a bot token

`users.list` needs `users:read` on a bot token. The OAuth credentials that sign
maintainers in cannot do it: Better Auth's Slack provider requests `openid`,
`profile` and `email` and nothing else, so the access token already sitting on
`account` is useless for this. `SLACK_BOT_TOKEN` is therefore a new, separate
credential, and `src/data/slackMembers.ts` follows the mock gate every other
external source in `src/data/` uses — cached with a `slack-members` tag, faker
members when the token is absent, and a hard failure in a production build.
