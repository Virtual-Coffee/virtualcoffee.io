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
A referral from a **Volunteer**, spent from their **Invite Allowance** and sent
as a **Claim Link**. An application arising from one enters the Waitlist with
priority. An Invite nobody claims eventually lapses, and the Volunteer gets it
back.
_Avoid_: Referral, nomination

**Invite Allowance**:
How many Invites a Volunteer may currently give out. It grows a little each
month and is spent one Invite at a time.
_Avoid_: Quota, credits, balance

**Claim Link**:
The single-use link an Invite sends to the person being invited. It carries them
to the ordinary join form, where they still answer every question and agree to
the Code of Conduct themselves.
_Avoid_: Invite link, referral link, token

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

**Volunteer**:
A Member trusted to give out Invites. A Volunteer can be paused
(`deactivated_at`): the row and its history stay, but they stop accruing and
lose the `volunteer` role until they are reactivated. Imported volunteers who
were inactive in Airtable arrive paused (ADR 0012).
_Avoid_: Volunteer signup (that is the form), referrer, sponsor

**Member Profile**:
A voluntary public listing on `/members`, authored as a file in
`src/content/members/` and merged with GitHub profile data. **Unrelated to a
Membership Application**: it holds no email, no application and no approval
state, and a Member need not have one.
_Avoid_: Member record, member page, profile

**Admin**:
Someone who holds every **Permission** — every Section of `/admin`, including
CoC Reports. Authenticated by Slack, and authorised by a **Role** held in the
database. Not everyone who can reach `/admin` is an Admin: a narrower Role gets
someone into one Section and nowhere else.
_Avoid_: Moderator, staff, maintainer (a maintainer is a community role, which
does not by itself confer admin access)

## Submissions

**Submission**:
Something a non-member sends through a public form on the site that a maintainer
has to act on. Four kinds, below. Distinct from a **Membership Application**,
which is a request to join and has a pipeline of its own.
_Avoid_: Form submission, enquiry, ticket, request

**CoC Report**:
A report that someone breached the Code of Conduct. May be anonymous — the form
asks for a name and email and says to skip both if the reporter prefers.
Deliberately readable by fewer people than the other kinds.
_Avoid_: Complaint, incident, violation

**Volunteer Signup**:
A form submission from someone offering to help with a role or initiative. It is
how someone might _become_ a **Volunteer**, and is not one — a Volunteer is a
person who can give out Invites, and most have never filled this in.
_Avoid_: Application (a Membership Application is a different thing), Volunteer

**Lunch & Learn Idea**:
A proposed talk. Becomes an issue in the community docs repo, which is where the
work of scheduling it actually happens.
_Avoid_: Talk submission, proposal

**Coffee Table Group Request**:
A proposal for a new small special-interest group.
_Avoid_: Group application

## Access

**Section**:
One area of `/admin` — the Waitlist, each kind of Submission, the Volunteers
roster, or User Management. A Permission is always over a Section.

**Permission**:
A capability over one Section: `read` to see it, `manage` to change anything in
it. Someone can hold `read` without `manage`.

**Role**:
A named set of Permissions. **Admin** holds every Section. The narrower roles
each hold one, so a maintainer can help with a single area without being given
the membership queue or CoC Reports. One Role holds no Section at all:
**Volunteer** is about `/invites`, which is not part of `/admin`.
_Avoid_: Permission level, group, tier

**Pending Grant**:
A Role assigned to a Slack member before that person has ever signed in to the
site. Applied the first time they do, after which the Grant is _claimed_ and
their Role is authoritative. Unrelated to an **Invite**, which is a volunteer's
referral into the Waitlist.
_Avoid_: Invite, pre-provision, reservation
