/**
 * Delivery Mode for anything the site sends out — email, Slack posts, GitHub
 * issues, writes to the Events Calendar. Live delivery is production only; everywhere else is Captured
 * (built and logged, the caller carries on as though it went) unless an opt-in
 * says otherwise. Email's opt-in is Local (`SMTP_HOST`, a local-only sink such
 * as Mailpit), honoured on a checkout only. See docs/adr/0013.
 *
 * `CONTEXT` is Netlify's: `production`, `deploy-preview`, `branch-deploy`, or
 * `dev` under `netlify dev`. Plain `next dev` has none. Live is decided on
 * "production or not"; Local on "a checkout or not" — a deploy is neither.
 */

export type DeliveryMode = 'live' | 'captured';

export function isProduction(): boolean {
	return process.env.CONTEXT === 'production';
}

/** For log lines and warnings: which deploy captured the message. */
export function deployContext(): string {
	return process.env.CONTEXT || 'local';
}

/** Whether a deploy is one of Netlify's, as opposed to a checkout. */
function isDeployed(): boolean {
	return Boolean(process.env.CONTEXT) && process.env.CONTEXT !== 'dev';
}

/** `ada@example.test` → `a•••@example.test`; a Slack channel is left alone. */
export function maskAddress(target: string): string {
	const at = target.indexOf('@');
	if (at < 1) return target;
	return `${target[0]}•••${target.slice(at)}`;
}

/** Every link in a message, so a walkthrough can still follow the one it sent. */
export function linksIn(body: string): string[] {
	const links = (body.match(/https?:\/\/[^\s<>"')]+/g) ?? []).map((link) =>
		// A link at the end of a sentence carries the full stop with it.
		link.replace(/[.,;:!?]+$/, ''),
	);
	return [...new Set(links)];
}

/**
 * The Captured sink is the function log — the `netlify dev` terminal locally,
 * the deploy's function log on a preview. Locally the whole message goes in.
 * On a deploy the message is about a real person (docs/adr/0007) and the log
 * outlives the walkthrough, so only what the walkthrough needs is written:
 * whom it was for, masked; what it was; and its links, which is how a
 * reviewer follows an invite. docs/adr/0013.
 */
export function capture(
	kind: 'email' | 'slack' | 'github issue',
	target: string,
	body: string,
	details?: Record<string, string | undefined>,
): void {
	if (isDeployed()) {
		console.info(
			`[${kind} captured] ${deployContext()} ${maskAddress(target)}`,
			...(details ? [details] : []),
			...linksIn(body).map((link) => `\n${link}`),
		);
		return;
	}

	console.info(
		`[${kind} captured] ${deployContext()} ${target}`,
		...(details ? [details] : []),
		`\n${body}`,
	);
}

export type EmailDelivery =
	| { mode: 'live' }
	| { mode: 'captured'; context: string }
	| { mode: 'local'; context: string };

/**
 * `SMTP_HOST` turns Captured into Local: delivered for real, exactly as
 * production would address it, to a local-only SMTP sink such as Mailpit — no
 * Google credentials needed. It never leaves the machine, so no redirect
 * address is involved. Only a checkout honours it: on a deploy the same
 * variable would name a host that real applicants' mail can reach, so a
 * preview stays Captured whatever is set.
 */
export function emailDelivery(): EmailDelivery {
	if (isProduction()) return { mode: 'live' };

	if (!isDeployed() && process.env.SMTP_HOST?.trim()) {
		return { mode: 'local', context: deployContext() };
	}
	return { mode: 'captured', context: deployContext() };
}

/**
 * Slack and GitHub have no address to redirect to; their opt-in is
 * `NOTIFY_LIVE_OUTSIDE_PRODUCTION=true`, paired with per-context webhook and
 * App values that point at a test channel or repository.
 */
export function notifyDelivery(): 'live' | 'captured' {
	if (isProduction()) return 'live';
	return process.env.NOTIFY_LIVE_OUTSIDE_PRODUCTION === 'true'
		? 'live'
		: 'captured';
}

/**
 * Writes to the Events Calendar (`/admin/events`) are the same shape: there is
 * one real calendar, so the opt-in `CALENDAR_LIVE_OUTSIDE_PRODUCTION=true` is
 * meant to be paired with a `GOOGLE_CALENDAR_ID` that names a scratch calendar
 * the service account can edit. Reads are never gated.
 */
export function calendarDelivery(): 'live' | 'captured' {
	if (isProduction()) return 'live';
	return process.env.CALENDAR_LIVE_OUTSIDE_PRODUCTION === 'true'
		? 'live'
		: 'captured';
}
