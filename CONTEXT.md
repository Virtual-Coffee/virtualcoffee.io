# Virtual Coffee

The public website for Virtual Coffee, a deliberately small developer community.
This glossary covers the **membership pipeline** — how someone gets from "I'd
like to join" to "I'm in the Slack" — along with the **Submissions** the site's
other public forms produce, and the **access** model that decides who can work
on either.

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
Someone who holds every **Permission** — every Section of `/admin`, including
CoC Reports. Authenticated by Slack, and authorised by a **Role** held in the
database. Not everyone who can reach `/admin` is an Admin: a narrower Role gets
someone into one Section and nowhere else.
_Avoid_: Moderator, staff, maintainer (a maintainer is a community role, which
does not by itself confer admin access)

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
