# Virtual Coffee

The public website for Virtual Coffee, a deliberately small developer community.
This glossary covers the **membership pipeline** — how someone gets from "I'd
like to join" to "I'm in the Slack" — along with the **Submissions** the site's
other public forms produce, and the **access** model that decides who can work
on either.

## Membership

**Membership Application**:
One person's request to join, and the record of its progress through the
pipeline. Carries the applicant's details and their long-form answers.
_Avoid_: Signup, registration, membership form, member record

**Waitlist**:
The live queue of applications awaiting a first decision. It is a working
queue, not an archive — historical applications are not on it.
_Avoid_: Waiting list, backlog

**Coffee Invite**:
The first of two approvals. The applicant is taken off the Waitlist and emailed
a link to a Coffee.
_Avoid_: Approval, first approval, invite

**Membership Approval**:
The second of two approvals, granted after the applicant attends a Coffee.
Sends the welcome email and the Slack invite.
_Avoid_: Approval, final approval, acceptance

**Lapsed**:
An application that went cold without anyone deciding on it. Distinct from
**Declined**, which records a decision a maintainer actually made.

**Coffee**:
The weekly hour-long Zoom chat. Attending one is the step between a Coffee
Invite and a Membership Approval.
_Avoid_: Meeting, call, event

## People

**Member**:
Someone whose Membership Application reached `member` status. Membership is
about access to the community, not about appearing on the website.

**Member Profile**:
A voluntary public listing on `/members`, authored as a file in the repo and
merged with GitHub profile data. **Unrelated to a Membership Application**: it
holds no email, no application and no approval state, and a Member need not
have one.
_Avoid_: Member record, member page, profile

**Admin**:
Someone whose Role holds every Section, CoC Reports included. Authenticated by
Slack, authorised by the Role held in the database. Not everyone who can reach
`/admin` is an Admin: a narrower Role gets someone into one Section and nowhere
else.
_Avoid_: Moderator, staff, maintainer (a maintainer is a community role, which
does not by itself confer admin access)

## Access

**Section**:
One area of `/admin`. The list is `SECTIONS` in
`src/lib/access/permissions.ts`. A Permission is always over a Section.

**Permission**:
A capability over one Section: `read` to see it, `manage` to change anything in
it. Someone can hold `read` without `manage`.

**Role**:
A named set of Permissions. Admin holds every Section; the narrower Roles each
hold one, so one person can help with a single area without being given the
membership queue or CoC Reports. The `volunteer` Role holds no Section at all —
it is about `/invites`, which is outside `/admin`.
_Avoid_: Permission level, group, tier

**Pending Grant**:
A Role assigned to a Slack member id before that person has ever signed in to
the site. Applied on their first sign-in, after which the Grant is **claimed**
and their Role is authoritative.
_Avoid_: Invite, pre-provision, reservation

## History

**History**:
What has happened to a Membership Application or a Submission, one row per
happening: a status change, a note, an email or notification and whether it
went. Two tables (`application_event`, `submission_event`) but one concept and
one writer. Shown as History on a detail page and as the activity feed on the
dashboard.
_Avoid_: audit log, event log, activity table, timeline (the component, not
the concept)

## Outbound

**Delivery Mode**:
What happens to an email, Slack post or DM, or GitHub issue the site sends.
**Live** delivers it to the intended recipient; only production does that.
**Captured** builds and logs it and the pipeline carries on as though it went,
but nothing leaves the deploy. Which mode applies where is `docs/adr/0013`.
_Avoid_: Dry run, suppressed, sandbox, test mode

**Outbound**:
What one send came to, whatever it was: it went (`ok`), with a sentence for
History and, if it went but not as asked, a warning for the maintainer; or it
did not, with whether that is certain. A send that may have gone — the
connection dropped after the server began accepting — is a failure that is not
certain. Every sender returns one.
_Avoid_: result, response, status, notification result
