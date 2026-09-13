# Google Calendar is the system of record for Events

## Context

Events lived in Craft CMS with Solspace Calendar, the last thing the CMS did
for the site. Each Series carried custom fields beyond the schedule — a join
link, a Zoom host code, a Slack channel — that the Slack bots
(`Virtual-Coffee/vc-bots`) read for their announcements, and the maintainers
edited all of it in Craft's admin. Retiring Craft meant choosing where a
Series lives and where those extra fields go.

The community already keeps the Events Calendar on Google. Its ACL is the
maintainers as owners, one service account as owner, and the
`virtualcoffee.io` Google Workspace as reader; there is no public entry, so
the calendar is readable by anyone in the workspace and by the site and the
bots through that one service account, and by nobody else. Maintainers edit
it from Google's own UI, phones included. With the CMS gone the site (0004)
holds everything else in Netlify Database, so a Postgres `series` table with
the calendar as a projection was the obvious alternative: the admin page is
an ordinary form and every field is ours. It would also have made the site
the owner of recurrence, exceptions and cancellations — the exact machinery
Google runs for us and pushes notifications about — and turned every edit
made in Google's UI into a sync conflict.

The host code was the awkward field. It is Zoom's per-user host key, and the
first version of this decision had the bots fetch it from Zoom at send time
so the calendar would carry nothing sensitive. That cannot be built: Zoom
removed `host_key` from every API response in 2022 "for security reasons"
(<https://devforum.zoom.us/t/get-a-users-host-key-via-api/79004>), a live
probe with the admin user scopes confirmed no user returns one, and Zoom's
own advice is to keep your own datastore. Google's `extendedProperties.private`
is scoped to the calendar's copy of the event, not to the application that
wrote it, so whoever can read the calendar through the API can read a
private property — the workspace, here. Google's UI cannot edit extended
properties at all.

## Decision

**Google Calendar is the system of record for Series and Events.** The site
and the bots read the same Events Calendar with the same service account;
`/admin/events` is a client of the Calendar API and stores nothing of its
own. Recurrence, exceptions, Cancels and Reschedules are Google's, so the
admin page exposes them rather than reimplementing them: a Cancel or Restore
is the instance's `status`, a Reschedule is the instance's `start`/`end`,
and a Series edit is a patch of the recurring event — applied to every
Event of it, past ones included, with Google keeping the exceptions. "This
and following", which Google does by splitting the Series, stays in Google's
UI.

**The Join Link is the event's `location`.** It is the field Google shows
and lets a maintainer edit, and it is what every Series already carries. The
`joinLink` and `slackChannelId` private properties the bots once read are
retired.

**The Host Code is `extendedProperties.private.hostCode`.** It is an Event
field, kept where the bots read it (vc-bots ADR 0001): the admin page is the
only writer, since Google's UI cannot set it; the bots show it in their
event-admin mirror and refuse to announce a Zoom Event without one, so the
admin page requires it whenever the Join Link is a Zoom join URL. The site's
public read never touches extended properties. Anyone who can read the
calendar through the API can read the code — the workspace — and that
exposure is accepted; the calendar is not public.

**Descriptions are Markdown.** The bots render them for Slack with
`slackify-markdown`; the site renders them with its own Markdown pipeline. A
description that still carries HTML tags — the shape Craft left behind — is
rendered as HTML until the calendar is migrated.

**Writes are conditional.** The admin page sends the `etag` it loaded as
`If-Match` on every update and asks the maintainer to reload on a `412`, so
an edit made in Google's UI in the meantime is never silently overwritten.

**A Series is Ended, not deleted.** Google's delete takes every Event of the
Series with it, past ones included — history `/events` and the bots have
shown. Ending sets the rule's `UNTIL` to now instead; only a Series that has
never run is deleted outright.

**Calendar writes have a Delivery Mode (0013).** There is one real calendar,
so outside production every write is captured unless
`CALENDAR_LIVE_OUTSIDE_PRODUCTION=true`, which is meant to be paired with a
`GOOGLE_CALENDAR_ID` naming a scratch calendar. Reads are never gated.

**The Series form edits two shapes of rule** — weekly on days, monthly on
the nth weekday(s) — which is every rule the community has ever used and
what Google's own picker offers minus daily, yearly and by-month-day. No
maintained React recurrence editor exists, so the form is ours and `rrule`
only parses, serialises and describes; anything else is shown as text and
edited in Google.

## Consequences

- Anything on the Events Calendar is visible to the whole workspace through
  the API, private properties included. That is the bar for what may go on
  it; a Host Code clears it, a password would not.
- Rotating a Host Code is an edit on `/admin/events`, and nowhere else.
- A Series' standing description and Join Link live on the recurring event
  in Google, where the site and the bots both read them.
- The calendar itself needs a one-off migration on the bots' side: set
  `location` on the two Virtual Coffee Series whose old `joinLink` property
  disagrees with it, clear `joinLink`, keep `hostCode`, and convert the
  descriptions from HTML to Markdown.
- The site is a client of Google for events: an outage there is an outage
  here. `/events` stays cached for twelve hours and fails a production build
  loudly rather than rendering an empty list, as before.
- The service account's scope is `calendar.events` — one client for reads
  and writes — and each admin write revalidates the `events` cache tag and
  the pages that read it.
