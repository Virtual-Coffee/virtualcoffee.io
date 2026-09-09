# Per-section roles for /admin

`/admin` started with one role. Everyone who could reach it could do everything
in it, which was fine when the only thing in it was the membership queue.

Adding CoC Reports made that untenable. Those reports go to a _private_ Slack
group, not to a channel every maintainer reads — the audience for them is
already narrower than "everyone with admin access", and putting them behind the
existing single role would have widened who can read them. Volunteers helping
with one area is also a stated goal, and there was no way to express it.

## The model

`src/lib/permissions.ts` declares one access-control resource per section, each
with `read` and `manage`. `read` is enough to see a section and open its detail
views; `manage` is needed to change anything. That split is what makes "let
someone watch a queue without acting on it" expressible, which a single
`access` action would not.

Roles are built from those statements: `admin` holds every section, and one
narrow role per section holds exactly one.

## Roles live comma-separated in `user.role`

Better Auth's admin plugin supports this natively — `hasPermission` in
`better-auth/plugins/admin` does `(input.role || …).split(",")` and authorises
if _any_ role matches. So someone can be `admin,coc_reviewer` in the column that
already exists, with no schema change. `src/lib/permissions.ts` holds the only
two functions that know about that encoding.

## `adminRoles` stays `['admin']`

The admin plugin's `adminRoles` option gates its _own_ endpoints — ban,
impersonate, set-role — which only `/admin/user-management` uses. The narrow roles are
deliberately absent from it. A `volunteer_coordinator` must be able to reach
their section and nothing else; being able to ban or impersonate users is not
"nothing else".

## The layout is not the boundary

`(protected)/layout.tsx` only checks that the viewer holds _some_ section. Each
section gates itself, and every server action re-checks independently, per 0003. This is easy to get wrong: the first version of this change left
`/admin/waitlist` and `/admin/user-management` relying on the layout alone, which meant a
volunteer with one narrow role could open the membership queue and the User Management
screen. **A new section is not gated until its own page says so.**

Sections a viewer cannot read return 404, not 403. Someone who only handles
volunteer signups should not learn that a CoC section exists.

## `admin` holds CoC too

An Admin can read CoC Reports without holding `coc_reviewer`. That was a
deliberate call: it keeps one coherent "full maintainer" role and avoids
locking someone out mid-incident. `coc_reviewer` earns its place as the role a
_non-admin_ volunteer can be given. If the CoC audience should be narrower than
the admin group, the change is one line — remove `coc` from the `admin` role —
because the resource is already separate.
