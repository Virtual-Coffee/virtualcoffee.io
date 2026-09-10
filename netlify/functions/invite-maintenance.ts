import { runInviteMaintenance } from './_shared/inviteMaintenance';

/**
 * Daily upkeep for Volunteer Invites.
 *
 * A scheduled function rather than a route: Netlify's docs are explicit that a
 * function with a `schedule` "will not accept standard incoming web requests",
 * so there is no public surface to guard and no shared secret to leak. The
 * alternative — a GitHub Action posting to an authenticated route — meant a
 * privileged write reachable from the internet for something with no reason to
 * be.
 *
 * Daily rather than monthly even though the accrual is monthly. The accrual is
 * written as "ensure this month's row exists", keyed by a unique index on the
 * period, so a run that fails or is skipped is made good by the next day's and
 * a run that happens twice changes nothing. A monthly schedule that missed its
 * window would leave every Volunteer short until somebody noticed.
 */
export default async () => {
	try {
		const report = await runInviteMaintenance();
		console.log('Invite maintenance', report);
	} catch (error) {
		// Netlify retries a failed scheduled function; every step is idempotent,
		// so letting it throw is safe and a swallowed error would be invisible.
		console.error('Invite maintenance failed', error);
		throw error;
	}
};

export const config = { schedule: '@daily' };
