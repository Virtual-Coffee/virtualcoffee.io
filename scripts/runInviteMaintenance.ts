import { runInviteMaintenance } from '../netlify/functions/_shared/inviteMaintenance';

/**
 * Run the daily invite upkeep by hand, against the local database.
 *
 * The scheduled function it wraps accepts no web requests, so this is the only
 * way to exercise accrual and expiry without waiting for Netlify's cron. Safe
 * to run repeatedly: the accrual is keyed on the month by a unique index and
 * the expiry only touches Invites whose Claim Link has actually run out.
 *
 * Goes through `scripts/with-local-netlify.ts`, which refuses any connection
 * string that is not localhost.
 */
async function main() {
	if (process.env.CONTEXT === 'production') {
		throw new Error('Refusing to run maintenance against production.');
	}

	const report = await runInviteMaintenance();

	console.log(`Period:          ${report.period}`);
	console.log(`Accrued:         ${report.accrued}`);
	console.log(`Expired:         ${report.expired}`);
	console.log(`Expiry failures: ${report.expiryFailures}`);
	console.log(`Emailed:         ${report.emailed}`);
	console.log(`Email failures:  ${report.emailFailures}`);

	process.exit(report.expiryFailures > 0 ? 1 : 0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
