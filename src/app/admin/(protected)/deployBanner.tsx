/**
 * Outside production, /admin runs against a copy of production's data with
 * production's roles (docs/adr/0007), and nothing it would send is delivered.
 * Working the queue here looks exactly like the real thing and reaches nobody
 * — so say so on every page. `netlify dev` sets CONTEXT=dev; `next dev` sets
 * nothing; both are local.
 */
export function DeployBanner() {
	const context = process.env.CONTEXT;
	if (context === 'production') return null;

	const preview = context === 'deploy-preview' || context === 'branch-deploy';

	return (
		<div className="bg-warning-subtle border-bottom small px-3 px-lg-4 py-1">
			<strong className="text-capitalize">
				{preview ? context.replace('-', ' ') : 'Local'}
			</strong>
			{preview ? ' — a copy of production. ' : ' — '}
			Nothing done here reaches an applicant or a channel; email and Slack are
			captured to the log.
		</div>
	);
}
