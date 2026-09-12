# Volunteer access lives outside the Section model

0006 built `/admin` out of Sections: one access-control resource per area, a
narrow Role holding one of them, and `requirePermission()` on every page and
every server action. Volunteer Invites needed a screen for people who are not
maintainers at all, and the obvious move was to make it a seventh Section.

It is not one. `volunteer` is `ac.newRole({})` — a Role that grants no Section —
and `/invites` sits outside `/admin` behind its own boundary in
`src/lib/volunteerAccess.ts`.

## Why not a Section

Two reasons, and the second is the one that settled it.

**A Volunteer is not a maintainer.** Every Section is an area of the admin
panel, and holding one means seeing `/admin`, its nav, and the dashboard scoped
to what you hold. A Volunteer has no business there: they are a community member
with a small capability, not someone working a queue. Giving them a Section
would have meant either showing them an admin shell that contained one thing, or
special-casing the shell to hide itself from certain Sections — which is a
Section that is not really a Section.

**`/admin` does not exist on deploy previews.** `adminRoutesEnabled()` returns
false for `deploy-preview` and `branch-deploy` unless `PREVIEW_ADMIN_BYPASS` is
set, because those URLs are public and the database behind them is seeded from
production (0007). That is right for `/admin` and wrong for this: `/invites` is
a member-facing feature that has to work in production regardless of a preview
flag, and has to be reviewable on a preview at all. A Section would have
inherited that gate, and the feature would have 404'd on every preview until
somebody noticed.

## Why still a Role

The alternative to a Role was a `volunteer` table row as the only marker, with
`/invites` asking "is there a row?". That would have been a second
authorization mechanism sitting beside the first, which is the thing 0006 exists
to prevent — and it would have thrown away Pending Grants. 0009 built
pre-provisioning on Slack member ids so that access can be given to someone who
has never signed in, and volunteering is exactly that case: the Airtable import
brings 91 people across, of whom most have never touched the site.

So `volunteer` is a Role like any other. It is in `roles`, `parseRoles()`
reports it, `serialiseRoles()` writes it, a Pending Grant carries it, and
`claimPendingGrant()` applies it. It simply authorises nothing inside `/admin`,
which falls out of the existing checks with no special cases:
`visibleSections()` is empty, so `requireSession()` turns a Volunteer away from
`/admin` exactly as it turns away someone holding nothing at all.

A Role that grants nothing looks like a mistake, which is why both the role
definition and `volunteerAccess.ts` say at length that it is not.

## `volunteerAccess.ts` is a sibling, not a subclass

It shares `getSession()` — so `ADMIN_DEV_BYPASS` and the preview bypass work
there too, and a contributor with no Slack credentials can run
`ADMIN_DEV_BYPASS_ROLES=volunteer` — and shares nothing else. It calls neither
`adminRoutesEnabled()` nor `visibleSections()`, and its header says so, because
both are the kind of thing a later reader would add for consistency without
realising what they were turning off.

It also redirects where `requirePermission()` 404s. That asymmetry is
deliberate: a `volunteer_coordinator` reaching `/admin/submissions/coc` should
not learn the page exists, whereas anyone may reach `/invites` and most of them
are members who were told about it. Pretending the page is not there would be
unhelpful to the exact people it is for.

## The cost

Two authorization entry points now exist, and a future reader has to notice that
`requireVolunteer()` is not `requirePermission()`. The mitigation is that they
live next to each other, in files that reference one another, and that the
narrower one grants exactly one capability.

There is also a rename in the blast radius. `volunteers` used to name the
Section guarding the Volunteer Signup queue — a form submission from someone
offering to help. That is a different noun from a Volunteer who holds Invites,
so the Section became `volunteerSignups` and `volunteers` now names the roster.
The `SubmissionKind` key is untouched, so `/admin/submissions/volunteers` still
works and no database identifier moved.

## Also considered

**Sign-in.** `/admin/sign-in` gained a role-aware redirect, so a Volunteer who
lands there is sent to `/invites` rather than told they are "signed in, but not
an admin". But `/invites` has its own sign-in page as well, because
`/admin/sign-in` begins with `adminRoutesEnabled()` and would 404 on a preview —
the same reason the whole feature is outside that tree. The two pages share the
button, the provider and the callback handler; only the destination and the
copy differ.

**Granting.** `volunteer` is deliberately absent from `GRANTABLE_ROLES`, so User
Management cannot set it. Making someone a Volunteer needs a `volunteer` row as
well as the Role, and two ways to do half of that is how you get someone who
accrues Invites they cannot spend. `/admin/volunteers` writes both in one
transaction. Because that leaves a Role the picker cannot set, `setUserRoles`
and `setPendingGrantRoles` now preserve any Role outside `GRANTABLE_ROLE_NAMES`
— without that, "Revoke all" would silently strip it.
