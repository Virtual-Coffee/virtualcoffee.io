import { redirect } from 'next/navigation';

import { getSession, sessionRoles } from '@/lib/adminAccess';
import { type Session } from '@/lib/auth';

/**
 * The authorization boundary for /invites (docs/adr/0010). Two things it must
 * never do:
 *   - call `adminRoutesEnabled()` — that 404s previews, and /invites has to
 *     work in production and be reviewable on a preview regardless;
 *   - ask `visibleSections()` — `volunteer` grants no Section on purpose.
 * `getSession()` is shared, so `ADMIN_DEV_BYPASS_ROLES=volunteer` works here.
 */
export function isVolunteer(session: Session | null): boolean {
	return sessionRoles(session).includes('volunteer');
}

/** Read off the session rather than looked up, so a page render costs no query. */
export function sessionSlackUserId(session: Session | null): string | null {
	return session?.user.slackUserId ?? null;
}

export type VolunteerSession = { session: Session; slackUserId: string };

/**
 * Redirects rather than 404s, unlike `requirePermission`: the people who reach
 * /invites are members who were told about it, not roles probing for pages.
 */
export async function requireVolunteer(): Promise<VolunteerSession> {
	const session = await getSession();

	if (!session || !isVolunteer(session)) {
		redirect('/invites/sign-in');
	}

	const slackUserId = sessionSlackUserId(session);

	if (!slackUserId) {
		// A real user whose account never got a Slack member id (bypass sessions
		// always carry one). Nothing the viewer can do, so explain rather than
		// offer a sign-in button.
		redirect('/invites/sign-in?problem=no-slack-id');
	}

	return { session, slackUserId };
}
