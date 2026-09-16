# Virtual Coffee

The public website for Virtual Coffee, a deliberately small developer community.
This glossary covers the **membership pipeline** — how someone gets from "I'd
like to join" to "I'm in the Slack" — along with the **Submissions** the site's
other public forms produce, the **Events** the community runs, and the
**access** model that decides who can work on any of them.

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
the welcome email, which carries the handbook and the Slack invite.
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

## Events

**Events Calendar**:
The single calendar that holds every Series and Event the community runs.
Readable by everyone in the virtualcoffee.io Google Workspace, and by the site
and the Slack bots through one service account; not public.
_Avoid_: Calendar, Google Calendar, CMS

**Series**:
A recurring entry on the Events Calendar. Owns the standing description and
the Join Link that each of its Events inherits.
_Avoid_: Recurring event, schedule, meeting

**Event**:
One dated occurrence, of a Series or on its own. What `/events` lists and the
bots announce.
_Avoid_: Meeting, session, instance, occurrence, calendar event

**Join Link**:
The URL people follow to attend an Event. The same for every Event of a
Series unless one Event's is changed.
_Avoid_: Zoom link, location, join URL

**Host Code**:
The Zoom host key for an Event, kept on the Events Calendar where only the
admin page can set it. The Slack bots show it to the host; a Zoom Event has
one or the bots will not announce it.
_Avoid_: Host key, hostCode, Zoom key, password

**Event Type**:
Which kind of thing a Series or Event is (Virtual Coffee, Lunch & Learn, …),
from a fixed list. Set on the admin page, required on every save; the planned
calendar feed filters on it.
_Avoid_: Category, tag, kind, label, eventType

**Cancel**:
Declare that one Event will not happen. The Series continues.
_Avoid_: Delete, remove

**Reschedule**:
Move one Event to a different time. The Series is unchanged.
_Avoid_: Move, edit time, exception

**Restore**:
Take back a Cancel or a Reschedule: the Event happens, at the time its
Series' rule gives it.
_Avoid_: Un-cancel, reinstate, undelete, move back

**End**:
Declare that a Series has no further Events. Its past Events remain on the
Events Calendar.
_Avoid_: Delete, remove, stop, archive

## Access

**Section**:
One area of `/admin` — the Waitlist, each kind of Submission, the Volunteers
roster, the Events Calendar, or User Management. A Permission is always over a
Section.

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

## Outbound

**Delivery Mode**:
What happens to an email, Slack post, or GitHub issue the site sends. **Live**
delivers it to the intended recipient, and only the production site does that.
**Captured** builds and logs it and the pipeline carries on as though it went,
but nothing leaves the deploy — the default everywhere else. **Local** delivers
an email for real, addressed as production would, to a local-only SMTP sink such
as Mailpit (`SMTP_HOST`); it never leaves the machine, and only a checkout can
select it — a deploy ignores the variable.
_Avoid_: Dry run, suppressed, sandbox, test mode
