# Per-section roles for /admin

## Context

`/admin` started with one role: everyone who could reach it could do
everything in it. CoC Reports made that untenable — they go to a _private_
Slack group, so their audience is already narrower than "everyone with admin
access" — and volunteers helping with one area is a stated goal that a single
role cannot express.

## Decision

`src/lib/permissions.ts` declares one access-control resource per section,
each with `read` and `manage`. `read` is enough to see a section and open its
detail views; `manage` is needed to change anything, which is what makes "let
someone watch a queue without acting on it" expressible. Roles are built from
those statements: `admin` holds every section, and one narrow role per section
holds exactly one.

**Roles live comma-separated in `user.role`.** Better Auth's admin plugin
supports this natively — `hasPermission` splits on `,` and authorises if _any_
role matches — so `admin,coc_reviewer` fits the column that already exists.
`src/lib/permissions.ts` holds the only two functions that know the encoding.

**`adminRoles` stays `['admin']`.** That option gates the plugin's _own_
endpoints — ban, impersonate, set-role — which only `/admin/user-management`
uses. A `volunteer_coordinator` must reach their section and nothing else;
banning users is not "nothing else".

**`admin` holds CoC too.** One coherent "full maintainer" role, and nobody is
locked out mid-incident. `coc_reviewer` is the role a _non-admin_ volunteer can
be given. If the CoC audience should ever be narrower than the admin group, the
change is one line, because the resource is already separate.

## Consequences

- **The layout is not the boundary.** `(protected)/layout.tsx` only checks that
  the viewer holds _some_ section. Each page gates itself with
  `requirePermission()`, and every server action re-checks independently
  (0003). A new section is reachable by every role until its own page says
  otherwise.
- Sections a viewer cannot read return 404, not 403. Someone who only handles
  volunteer signups should not learn that a CoC section exists.
