# Virtual Coffee

The public website for Virtual Coffee, a deliberately small developer community.
This glossary covers the **membership pipeline**: how someone gets from "I'd like
to join" to "I'm in the Slack".

## Membership

**Membership Application**:
One person's request to join, and the record of its progress through the
pipeline. Carries the applicant's details and their long-form answers.
_Avoid_: Signup, registration, membership form, member record

**Waitlist**:
The live queue of applications awaiting a first decision. It is a working queue,
not an archive — historical applications are not on it.
_Avoid_: Waiting list, backlog

**Coffee Invite**:
The first of two approvals. The applicant is taken off the Waitlist and emailed
a link to a Coffee.
_Avoid_: Approval, first approval, invite

**Membership Approval**:
The second of two approvals, granted after the applicant attends a Coffee. Sends
the welcome email and the Slack invite.
_Avoid_: Approval, final approval, acceptance

**Invite**:
A referral from an active volunteer, subject to a per-volunteer quota. An
application arising from one enters the Waitlist with priority.
_Avoid_: Referral, nomination

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
A voluntary public listing on `/members`, authored as a file in
`src/content/members/` and merged with GitHub profile data. **Unrelated to a
Membership Application**: it holds no email, no application and no approval
state, and a Member need not have one.
_Avoid_: Member record, member page, profile

**Admin**:
A maintainer who can review Membership Applications. Authenticated by Slack, and
authorised by a role held in the database.
_Avoid_: Moderator, staff, maintainer (a maintainer is a community role, which
does not by itself confer admin access)
