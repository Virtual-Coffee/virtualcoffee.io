# Google Calendar is the system of record for Events

## Context

Events lived in Craft CMS with Solspace Calendar, the last thing the CMS did
for the site. Each Series carried custom fields beyond the schedule — a join
link, a Zoom host code, a Slack channel — that the Slack bots
(`Virtual-Coffee/vc-bots`) read for their announcements, and the maintainers
edited all of it in Craft's admin. Retiring Craft meant choosing where a
Series lives and where those extra fields go.

The community already keeps the Events Calendar on Google, publicly readable
and subscribable, and maintainers edit it from Google's own UI, phones
included. With the CMS gone the site (0004) holds everything else in Netlify
Database, so a Postgres `series` table with the calendar as a projection was
the obvious alternative: private fields stay private, and the admin page is
an ordinary form. It would also have made the site the owner of recurrence,
exceptions and cancellations — the exact machinery Google runs for us and
pushes notifications about — and turned every edit made in Google's UI into
a sync conflict.

The bots' Google Calendar branch had kept the extra fields on the calendar as
`extendedProperties.private`, on the understanding that `private` hides them
from subscribers. Google's own documentation scopes private properties to
_the calendar's copy of the event_, not to the application that wrote them: a
public calendar has one copy, so any API reader with the calendar id sees
them, Zoom host code included. And the host code is not an Event fact at
all: Zoom's host key belongs to the Zoom user, every Virtual Coffee event
runs under the one Zoom account, and the bots already hold credentials for
it.

## Decision

**Google Calendar is the system of record for Series and Events.** The site
and the bots read the same Events Calendar with the same service account;
the admin page, when it lands, is a client of the Calendar API and stores
nothing of its own. Recurrence, exceptions, Cancels and Reschedules are
Google's, so the admin page exposes them rather than reimplementing them.

**The Join Link is the event's `location`.** It is the field Google shows
and lets a maintainer edit, and it is what every Series already carries.
Nothing is written to or read from `extendedProperties`.

**The Zoom host code is not an Event field.** The bots read the host key
from Zoom for the event-admin mirror; the calendar never carries it.

**Writes are conditional.** The admin page sends the `etag` it loaded as
`If-Match` on every update and asks the maintainer to reload on a `412`, so
an edit made in Google's UI in the meantime is never silently overwritten.

## Consequences

- Nothing on the Events Calendar is private, by design. Anything that must
  not be public does not go on it — there is no second, hidden field set to
  reach for.
- A Series' standing description and Join Link live on the recurring event
  in Google, where the site and the bots both read them.
- The `vc-bots` Google source drops its `extendedProperties` fallback chain
  and fetches the host key from Zoom (`Virtual-Coffee/vc-bots#14`).
- The site is a client of Google for events: an outage there is an outage
  here. `/events` stays cached for twelve hours and fails a production build
  loudly rather than rendering an empty list, as before.
- The service account's scope widens from `calendar.events.readonly` to
  `calendar.events` when the admin page lands, and each admin write
  revalidates the `events` cache tag.
