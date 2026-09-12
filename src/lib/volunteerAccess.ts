import { redirect } from 'next/navigation';

import { getSession } from '@/lib/adminAccess';
import { type Session } from '@/lib/auth';
import { parseRoles } from '@/lib/permissions';

/**
 * The authorization boundary for /invites.
 *
 * A sibling of `adminAccess.ts`, not a generalisation of it. What it
 * deliberately does *not* do is as important as what it does:
 *
 *   - It never calls `adminRoutesEnabled()`. That returns false on deploy
 *     previews and branch deploys unless `PREVIEW_ADMIN_BYPASS` is set, which is
 *     right for /admin — those URLs are shareable and the database behind them is
 *     a copy of production. /invites is a member-facing feature that has to work
 *     in production regardless of that flag, and has to be reviewable on a
 *     preview at all.
 *   - It never asks `visibleSections()`. The `volunteer` role grants no Section
 *     on purpose, so every question phrased in terms of Sections answers "no"
 *     for exactly the people this file exists to let in.
 *
 * `getSession()` is shared, which is what makes `ADMIN_DEV_BYPASS` and the
 * preview bypass work here too: set `ADMIN_DEV_BYPASS_ROLES=volunteer` and a
 * contributor with no Slack credentials gets a working /invites. See
 * docs/adr/0010.
 */
export function isVolunteer(session: Session | null): boolean {
	return parseRoles(
		(session?.user as { role?: string | null } | undefined)?.role,
	).includes('volunteer');
}

/**
 * The Slack member id everything about an allowance is keyed on.
 *
 * Read off the session rather than looked up, so a page render costs no query.
 * The dev and preview bypass sessions always carry one here —
 * `ADMIN_DEV_BYPASS_SLACK_ID`, or the `U_DEV_BYPASS` fallback that `pnpm
 * db:seed` creates a Volunteer for (`adminAccess.ts`) — so a bypass session
 * that authenticates as a Volunteer and then matches no `volunteer` row is a
 * seed or override mismatch, never a missing id.
 */
export function sessionSlackUserId(session: Session | null): string | null {
	return (
		(session?.user as { slackUserId?: string | null } | undefined)
			?.slackUserId ?? null
	);
}

export type VolunteerSession = { session: Session; slackUserId: string };

/**
 * Redirects rather than 404s, unlike `requirePermission`.
 *
 * The difference is who is knocking. A `volunteer_coordinator` reaching
 * /admin/submissions/coc should not learn that the page exists, so that boundary
 * 404s. Anyone can reach /invites, and most of them are members who were told
 * about it — sending them to a sign-in they can act on is more useful than
 * pretending the page is not there.
 */
export async function requireVolunteer(): Promise<VolunteerSession> {
	const session = await getSession();

	if (!session || !isVolunteer(session)) {
		redirect('/invites/sign-in');
	}

	const slackUserId = sessionSlackUserId(session);

	if (!slackUserId) {
		/**
		 * Only reachable for a real signed-in user whose account never got a Slack
		 * member id — not a bypass session, which always falls back to
		 * `U_DEV_BYPASS`/`U_PREVIEW_BYPASS` (`adminAccess.ts`;
		 * `volunteerAccess.test.ts` pins it). There is nothing the viewer can do
		 * about it, so this is the one case that shows an explanation instead of a
		 * sign-in button.
		 */
		redirect('/invites/sign-in?problem=no-slack-id');
	}

	return { session, slackUserId };
}
