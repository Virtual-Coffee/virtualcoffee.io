import { runInviteMaintenance } from './_shared/inviteMaintenance';

/**
 * Daily upkeep for Volunteer Invites. A scheduled function answers no web
 * requests, so there is no public surface to guard. Daily rather than monthly
 * so a missed run is made good the next day — every step is idempotent.
 * See docs/adr/0011.
 */
export default async () => {
	try {
		const report = await runInviteMaintenance();
		console.log('Invite maintenance', report);

		// An expiry that failed was logged and left `pending`, and the run
		// carried on so the accrual emails still went. Fail the run anyway:
		// that is how the failure becomes visible.
		if (report.expiryFailures > 0) {
			throw new Error(
				`${report.expiryFailures} invite(s) could not be expired; see the log above.`,
			);
		}
	} catch (error) {
		// Netlify retries a failed scheduled function; every step is idempotent,
		// so letting it throw is safe and a swallowed error would be invisible.
		console.error('Invite maintenance failed', error);
		throw error;
	}
};

export const config = { schedule: '@daily' };
