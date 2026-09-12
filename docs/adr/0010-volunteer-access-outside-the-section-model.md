# Volunteer access lives outside the Section model

## Context

0006 built `/admin` out of Sections: one access-control resource per area, a
narrow Role holding one of them, and `requirePermission()` on every page and
every server action. Volunteer Invites needed a screen for people who are not
maintainers at all, and the obvious move was a seventh Section.

## Decision

`volunteer` is `ac.newRole({})` — a Role that grants no Section — and
`/invites` sits outside `/admin` behind its own boundary,
`requireVolunteer()` in `src/lib/volunteerAccess.ts`.

### Why not a Section

**A Volunteer is not a maintainer.** Holding a Section means seeing `/admin`,
its nav, and the dashboard. A Volunteer is a community member with one small
capability; a Section for them is either an admin shell containing one thing
or a shell special-cased to hide itself — a Section that is not really one.

**`/admin` does not exist on deploy previews.** `adminRoutesEnabled()` is
false there unless `PREVIEW_ADMIN_BYPASS` is set (0007). Right for `/admin`,
wrong for a member-facing feature that has to work in production regardless of
a preview flag and has to be reviewable on a preview at all.

### Why still a Role

The alternative — a `volunteer` table row as the only marker — would be a
second authorization mechanism beside the first, which is what 0006 exists to
prevent, and it would throw away Pending Grants (0009). Volunteering is exactly
the pre-provisioning case: the Airtable import brings 91 people across, most of
whom have never signed in.

So `volunteer` is a Role like any other — in `roles`, parsed and serialised,
carried by a Pending Grant, applied by `claimPendingGrant()` — that authorises
nothing inside `/admin`. That falls out of the existing checks:
`visibleSections()` is empty, so `requireSession()` turns a Volunteer away from
`/admin` exactly as it turns away someone holding nothing.

### `volunteerAccess.ts` is a sibling, not a subclass

It shares `getSession()` — so `ADMIN_DEV_BYPASS` and the preview bypass work,
and `ADMIN_DEV_BYPASS_ROLES=volunteer` runs it locally without Slack — and
nothing else. It calls neither `adminRoutesEnabled()` nor
`visibleSections()`; both are the kind of thing a later reader adds for
consistency without noticing what they turn off.

It redirects where `requirePermission()` 404s. A `volunteer_coordinator`
reaching `/admin/submissions/coc` should not learn the page exists; anyone may
reach `/invites`, and most who do are members who were told about it.

## Consequences

- Two authorization entry points exist, side by side in files that reference
  one another; `requireVolunteer()` is not `requirePermission()`, and the
  narrower one grants exactly one capability.
- `volunteers` names the roster Section; the Volunteer Signup queue — a form
  submission from someone offering to help, a different noun — is
  `volunteerSignups`. The `SubmissionKind` key is untouched, so
  `/admin/submissions/volunteers` still works.
- `/invites` has its own sign-in page: `/admin/sign-in` begins with
  `adminRoutesEnabled()` and would 404 on a preview. The two share the button,
  provider and callback; `/admin/sign-in` also redirects a Volunteer to
  `/invites` rather than telling them they are "not an admin".
- `volunteer` is absent from `GRANTABLE_ROLES`. Making someone a Volunteer
  needs a `volunteer` row as well as the Role — two ways to do half of that is
  how someone accrues Invites they cannot spend — so `/admin/volunteers` writes
  both in one transaction, and `setUserRoles` / `setPendingGrantRoles` preserve
  any Role outside `GRANTABLE_ROLE_NAMES` so "Revoke all" cannot strip it.
