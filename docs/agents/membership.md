# Membership pipeline rules

The rules for the Postgres-backed membership pipeline, the public forms and `/admin`; read `CONTEXT.md` for the vocabulary. Each rule cites the ADR that decided it; open the ADR before changing the rule.

`/admin` is organised by Section, one route segment each under `src/app/admin/(protected)/`; the modules directly under `(protected)/` are shared. Adding a Section is a type error in `CARDS` (`src/lib/admin/dashboard.ts`) until it has a dashboard card or is excluded.

## Access

- Every Section page and server action under `/admin` gates itself with `requirePermission()` (`src/lib/access/adminAccess.ts`); the `(protected)` layout and the `/admin` dashboard only prove the viewer holds _some_ section, and the dashboard scopes what it shows with `visibleSections()` — `docs/adr/0003`, `docs/adr/0006`.
- `/invites` sits outside `/admin`: `requireVolunteer()` (`src/lib/access/volunteerAccess.ts`) shares only `getSession()` with the admin path, and the `volunteer` Role holds no Section — `docs/adr/0010`.
- A deploy preview is production's data behind production's Slack sign-in; `OAUTH_PROXY_SECRET` holds one value in every Netlify context — `docs/adr/0007`.
- CoC attachments live in Netlify Blobs and are served only through a route that checks `coc:read`.

## Writers

Each table has one writer; go through it.

- `src/lib/access/roleAssignment.ts` writes `user.role` and `pending_grant`, under one lock per Slack member. A Pending Grant matches on the Slack member id — `docs/adr/0009`.
- `src/lib/history/eventLog.ts` writes `application_event`, `submission_event` and `volunteer_event`: `recordOutcome()` turns a Send Outcome into History, `transitionAndRecord()` commits a status change with its event. Labels in `src/lib/history/eventLabels.ts` are keyed by the enums, so a new event type is a type error until labelled.
- `src/lib/volunteers/invites.ts` writes `volunteer_invite_ledger` and sends every Claim Link (`issueAndSend`, `resendClaimLink`).
- `src/lib/waitlist/lifecycle.ts` writes an Application's status and owns the guards, the send-first order and invite completion; the transition table is `applicationStatuses.ts`, which the action panel reads. Only the import writes `lapsed`.
- The Invite Allowance is an append-only ledger; a correction is a new row through `adjustBalance` with a reason — `docs/adr/0011`.
- Volunteers imported from Airtable come from a reviewed mapping — `docs/adr/0012`. Before running an Airtable script, read `scripts/airtable/README.md`.

## Ordering

- An admin action that emails about a status change sends first and writes the change after, reporting whether anything went out; `src/lib/waitlist/lifecycle.db.test.ts` pins the order. Adding a Volunteer writes first — `docs/adr/0010` — and so does a Claim Link, whose token must exist before the email, with a definite failure refunded and an uncertain one left charged — `docs/adr/0011`.
- A public form persists first and notifies second — `docs/adr/0005`. `submit()` (`src/lib/submissions/submitSubmission.ts`) is the one persist-then-announce for all four forms, and `submit.db.test.ts` pins the order (`src/app/join/action.db.test.ts` does for `/join`).

## Delivery

- Live delivery is `CONTEXT=production` only; everywhere else every email, Slack post, GitHub issue, DM and Events Calendar write is Captured unless `.env.example` names an opt-in — `docs/adr/0013`, `docs/adr/0014`.
- A new sender is a `deliver()` call in `src/lib/outbound.ts`, which decides the mode before the sender can reach its credentials. On a deploy `capture()` logs the masked recipient, subject and links and omits the body, because the data is real — `docs/adr/0007`.
- A Slack post is Block Kit built from `src/lib/slack/blocks.ts`: a typed value is a literal `rich_text` run, and mrkdwn is for static copy only — `docs/adr/0016`.

## Forms

- `/join` and the four public forms (`/report-coc-violation`, `/volunteer-at-virtual-coffee`, `/lunch-and-learn-idea`, `/start-coffee-table-group`) are `force-dynamic`: the spam guard (`src/util/forms/spamGuard.ts`) signs a per-render token that prerendering would bake into cached HTML.
- Every form action opens with `intake()` (`src/util/forms/intake.ts`), which owns that guard and the schema parse; shared fields are in `src/util/forms/fields.ts`.
- A `/join` submission that `suspectSpam()` matches is quarantined as `suspected_spam`: kept, and not announced — `docs/adr/0017`.

## Schema & ids

- A schema change is a new migration: `pnpm db:generate --name=<hyphenated-slug>`, both generated files committed — `docs/adr/0001`.
- `id` (UUIDv7, `newId()` in `src/db/ids.ts`) is the URL and foreign-key handle, checked with `isId()` on the way in; `reference` is display-only — `docs/adr/0008`.

## Local dev

- One-off scripts run through `scripts/with-local-netlify.ts`, which supplies the local connection string and refuses a non-local one.
- `ADMIN_DEV_BYPASS*` (`.env.example`) signs a local checkout in without Slack; a real session cookie takes precedence over it.
