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
The live queue of applications awaiting a first decision. It is a working
queue, not an archive — historical applications are not on it.
_Avoid_: Waiting list, backlog

**Application Source**:
How a Membership Application arrived: a Waitlist signup came through `/join`
on its own; a Volunteer invite came through a Claim Link and enters the
Waitlist with priority.
_Avoid_: Source, origin, channel, referral source

**Coffee Invite**:
The first of two approvals. The applicant is taken off the Waitlist and emailed
a link to a Coffee.
_Avoid_: Approval, first approval, invite

**Membership Approval**:
The second of two approvals, granted after the applicant attends a Coffee.
Sends the welcome email, which carries the handbook and the Slack invite.
_Avoid_: Approval, final approval, acceptance

**Lapsed**:
An application that went cold without anyone deciding on it. Distinct from
**Declined**, which records a decision a maintainer actually made.

**Declined**:
An application a maintainer decided against. A final status: the person is not
admitted, and unlike Lapsed someone chose it.
_Avoid_: Rejected, denied

**Suspected Spam**:
An application from `/join` whose name or email matched the bot signature. It
is held in **Quarantine** until a reviewer releases it to the Waitlist or
declines it; `docs/adr/0017`.
_Avoid_: Spam (unproven), rejected, blocked

**Quarantine**:
Where a Suspected Spam application waits: off the Waitlist, never announced,
never dropped.
_Avoid_: Spam folder, blocklist

**Coffee**:
The weekly hour-long Zoom chat — an Event whose Event Type is Virtual Coffee.
Attending one is the step between a Coffee Invite and a Membership Approval.
_Avoid_: Meeting, call, event

**Invite**:
A referral from a **Volunteer**, spent from their **Invite Allowance** and sent
as a **Claim Link**. An application arising from one enters the Waitlist with
priority. An Invite nobody claims expires, and the Volunteer gets it back.
_Avoid_: Referral, nomination, lapse (an application lapses; an Invite expires)

**Invite Allowance**:
How many Invites a Volunteer may currently give out. It grows a little each
month and is spent one Invite at a time; `docs/adr/0011`.
_Avoid_: Quota, credits, balance

**Accrual Notice**:
The record that a Volunteer was emailed about a month's growth in their Invite
Allowance, or that the attempt was made and failed.
_Avoid_: Accrual email, reminder

**Claim Link**:
The single-use link an Invite sends to the person being invited. It carries
them to the ordinary join form, where they still answer every question and
agree to the Code of Conduct themselves.
_Avoid_: Invite link, referral link, token

## People

**Member**:
Someone whose Membership Application reached `member` status. Membership is
about access to the community, not about appearing on the website.

**Volunteer**:
A Member trusted to give out Invites. A paused Volunteer keeps their row and
History but stops accruing and loses the `volunteer` Role until reactivated.
_Avoid_: Volunteer signup (that is the form), referrer, sponsor

**Member Profile**:
A voluntary public listing on `/members`, authored as a file in the repo and
merged with GitHub profile data. **Unrelated to a Membership Application**: it
holds no email, no application and no approval state, and a Member need not
have one.
_Avoid_: Member record, member page, profile

**Admin**:
Someone whose Role holds every Section, CoC Reports included. Authenticated by
Slack, authorised by their Role. Not everyone who can reach `/admin` is an
Admin: a narrower Role gets someone into one Section and nowhere else.
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
A proposed talk. Becomes a GitHub issue, where the work of scheduling it
happens.
_Avoid_: Talk submission, proposal

**Coffee Table Group Request**:
A proposal for a new small special-interest group.
_Avoid_: Group application

## Events

**Events Calendar**:
The single calendar that holds every Series and Event the community runs.
Readable by everyone in the virtualcoffee.io Google Workspace, and by the site
and the Slack bots; not public; `docs/adr/0014`.
_Avoid_: Calendar, Google Calendar, CMS — the product name is fine where the
copy means Google's own app ("Open in Google Calendar")

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
The Zoom host key for an Event, which the Slack bots show to the host.
_Avoid_: Host key, hostCode, Zoom key, password

**Event Type**:
Which kind of thing a Series or Event is (Virtual Coffee, Lunch & Learn, …).
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
One area of `/admin`. A Permission is always over a Section.

**Permission**:
A capability over one Section: `read` to see it, `manage` to change anything in
it. Someone can hold `read` without `manage`.

**Role**:
A named set of Permissions. Admin holds every Section; the narrower Roles each
hold one, so one person can help with a single area without being given the
membership queue or CoC Reports. The `volunteer` Role holds no Section — it is
about `/invites`, which is outside `/admin`; `docs/adr/0006`, `docs/adr/0010`.
_Avoid_: Permission level, group, tier

**Pending Grant**:
A Role assigned to a Slack member before that person has ever signed in to the
site. Applied on their first sign-in, after which the Grant is **claimed**;
`docs/adr/0009`.
_Avoid_: Invite, pre-provision, reservation

**Role assignment**:
Giving or taking a Role, directly on a user or as a Pending Grant.
_Avoid_: Permission change, provisioning

## History

**History**:
What has happened to a Membership Application, a Submission or a Volunteer, one
row per happening: a status change, a note, an email or notification and
whether it went. A Volunteer's History holds only send outcomes; their Invite
Allowance movements live in the ledger.
_Avoid_: audit log, event log, activity table, timeline (the component, not
the concept)

**Never announced**:
A Membership Application or Submission that was stored but nobody has been told
about: still in its open status, and either any announcement failed or none was
recorded; `docs/adr/0005`.
_Avoid_: unannounced, failed notification, missing notification

## Delivery

**Delivery Mode**:
What happens to an email, Slack post or DM, GitHub issue or Events Calendar
write the site sends. **Live** delivers it to the intended recipient; only
production does that. **Captured** logs it and the pipeline carries on as
though it went, but nothing leaves the deploy. **Local** delivers an email to a
local-only sink on a checkout; `docs/adr/0013`.
_Avoid_: Dry run, suppressed, sandbox, test mode

**Outbound**:
What one send came to: it went, or it did not, and if not, whether that is
certain. A send that may have gone is a failure that is not certain.
_Avoid_: Send result, response, status, notification result
