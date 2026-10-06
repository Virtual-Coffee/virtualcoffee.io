# The Events Calendar is the system of record for Events

## Context

Events lived in Craft CMS, the last thing the CMS did for the site. Each Series
carried fields beyond the schedule — a join link, a Zoom host code, a Slack
channel — that the Slack bots (`Virtual-Coffee/vc-bots`) read for their
announcements. Retiring Craft meant choosing where a Series lives and where
those fields go.

The community already keeps the Events Calendar on Google, readable by the
Workspace and, through one service account, by the site and the bots; it is not
public, and maintainers edit it from Google's own UI, phones included. A
Postgres `series` table with the calendar as a projection was the alternative:
every field would be ours. It would also make the site the owner of
recurrence, exceptions and cancellations, which Google already runs, and turn
every edit made in Google's UI into a sync conflict.

The host code was the awkward field. It is Zoom's per-user host key, Zoom
removed it from every API response "for security reasons"
(<https://devforum.zoom.us/t/get-a-users-host-key-via-api/79004>), and Zoom's
own advice is to keep your own datastore. Google's
`extendedProperties.private` is scoped to the calendar's copy of the event, so
anyone who can read the calendar through the API can read it, and Google's UI
cannot edit it at all.

## Decision

**The Events Calendar is the system of record for Series and Events.** The site
and the bots read the same calendar with the same service account;
`/admin/events` is a client of the Calendar API and stores nothing. Recurrence,
exceptions, Cancels and Reschedules are Google's, so the admin page exposes
them rather than reimplementing them: a Cancel is the instance's `status`, a
Reschedule is its `start`/`end`, a Restore puts both back, and a Series edit
is a patch of the recurring event. "This and following", which Google does by
splitting the Series, stays in Google's UI. The shape of a Series or Event is
declared once in `src/lib/events/eventDraft.ts`.

What lives where:

- **Join Link** is the event's `location`: the field Google shows and lets a
  maintainer edit.
- **Host Code** is `extendedProperties.private.hostCode`, written only by the
  admin page and required whenever the Join Link is a Zoom URL, because the
  bots refuse to announce a Zoom Event without one. The site's public read
  never touches extended properties. The exposure to the Workspace is
  accepted; the calendar is not public.
- **Event Type** is `extendedProperties.private.eventType`, a key from the
  fixed list in `src/lib/events/eventTypes.ts`, required on every save. The
  list is code, not data, so a new kind is a reviewable diff.
- **Descriptions** are Markdown: the bots render them for Slack, the site
  through its own pipeline.

**Writes are conditional.** The admin page sends the `etag` it loaded as
`If-Match` and asks the maintainer to reload on a `412`, so an edit made in
Google's UI in the meantime is never silently overwritten.

**A Series is Ended, not deleted.** Google's delete takes every Event of the
Series with it, past ones included — history `/events` and the bots have
shown. Ending sets the rule's `UNTIL` to now; only a Series that has never run
is deleted outright.

**The Series form edits two shapes of rule** (weekly on days, monthly on the
nth weekday), which is every rule the community has used. No maintained React
recurrence editor exists, so the form is ours and `rrule` only parses and
describes (`src/lib/events/recurrence.ts`); anything else is shown as text and
edited in Google.

**Calendar writes have a Delivery Mode (0013).** There is one real calendar,
so outside production every write is captured unless
`CALENDAR_LIVE_OUTSIDE_PRODUCTION` opts in, meant to be paired with a scratch
`GOOGLE_CALENDAR_ID`. Reads are never gated.

## Consequences

- Anything on the Events Calendar is visible to the whole Workspace through the
  API, private properties included. That is the bar for what may go on it; a
  Host Code clears it, a password would not.
- Rotating a Host Code is an edit on `/admin/events`, and nowhere else.
- The site is a client of Google for events: an outage there is an outage here,
  and a production build fails loudly rather than rendering an empty list.
- Ending or splitting a Series leaves Google returning cancelled placeholders
  for slots the truncated rule no longer generates. The admin read drops them:
  nothing was Cancelled and there is nothing to Restore.
