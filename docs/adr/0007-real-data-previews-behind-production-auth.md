# Deploy previews run against a real-data fork behind production's auth

## Context

Every deploy preview gets a database branch forked from production (0001).
That branch carries real applicants' emails and personal writing, CoC report
contents, and real maintainers' Slack accounts, and it sits behind a preview
URL that is public and shareable.

Slack's OAuth app registers a fixed list of redirect URIs, and a preview's
address is new every time, so on its own a preview could not sign anyone in.
Scrubbing the fork and letting the preview link stand in for a session would
mean reviewing `/admin` through faked rows and an identity nobody has, and
registering every schema change with the scrubber.

## Decision

**A preview is production's data behind production's door.** Nothing is
scrubbed, and there is no preview bypass. The people who can open `/admin` on
a preview are the people who can open it on production, because it is the
same `user` and `account` rows, the same roles, and the same Slack sign-in.

**Sign-in goes through production's callback.** Better Auth's `oAuthProxy`
plugin runs on every deploy (`src/lib/access/auth.ts`). A preview's sign-in sends
Slack to production's registered redirect URI; production exchanges the code,
checks the workspace, encrypts the profile with `OAUTH_PROXY_SECRET` and hands
it back to the preview, which creates the user and session in its own branch.
Production writes nothing. The secret has to be the same in every Netlify
context, and `BETTER_AUTH_SECRET` deliberately is not: a session token is
signed with the latter, so a token copied out of one branch is worthless
against another. A local checkout takes the same route: a maintainer signing
in locally puts the same secret in `.env`, and the Slack app needs no
`localhost` redirect URI.

**Nothing a preview would send is delivered** — outbound mail and
notifications are captured outside production — and every `/admin` page says
so in a banner: working the queue on a preview looks exactly like the real
thing and reaches nobody.

### Who a preview is protected from

With the door the same as production's, the audiences a scrub would defend
against are already covered:

- Anyone with the link now sees a sign-in page.
- A workspace member who has never been granted anything holds the default
  role, which grants no section, and is turned away — on previews as on
  production.
- The Netlify site team can read a preview's function log and its database
  branch. They are the same people who hold `admin` and `coc` on production,
  and can read production's database the same way.
- A pull request's build runs that pull request's code against the fork. Only
  Netlify's sensitive-variable policy for builds from outside the repository
  protects against that; a scrub inside the same build would not.

## Consequences

- Every preview branch holds real applicant and CoC data for as long as
  Netlify keeps the branch. That is the same data under the same access as
  production, and is treated as such.
- A maintainer signing in on a preview lands on their own row with their own
  roles; nothing has to be provisioned per preview. `ADMIN_BOOTSTRAP_SLACK_IDS`
  is production's bootstrap and does not need a preview value.
- `OAUTH_PROXY_SECRET` has to hold the same value in every Netlify context.
  Left unset, the plugin falls back to `BETTER_AUTH_SECRET`, which differs per
  context, and a preview's sign-in fails after the round trip with
  `invalid_profile` — that error means the secrets do not match.
- Netlify's **sensitive variable policy** must keep secrets and the database
  URL away from builds by unrecognised authors. It is a site setting, not
  code, and the only thing standing between a fork PR's build and the fork.
- Adding a table or column is just adding it; nothing has to be registered.
- Anything a preview reaches that is not the database is not forked: an
  opt-in that makes a preview write to a real external system (a calendar, a
  channel) writes to the real one.
