import { z } from 'zod';

/**
 * Delivery Mode for anything the site sends out — email, Slack posts, GitHub
 * issues. Live delivery is production only; everywhere else is Captured
 * (built and logged, the caller carries on as though it went) unless an opt-in
 * says otherwise. See docs/adr/0013.
 *
 * `CONTEXT` is Netlify's: `production`, `deploy-preview`, `branch-deploy`, or
 * `dev` under `netlify dev`. Plain `next dev` has none, which is non-production
 * too — the rule is "production or not", never "deployed or not".
 */

export type DeliveryMode = 'live' | 'captured' | 'redirected';

export function isProduction(): boolean {
	return process.env.CONTEXT === 'production';
}

/** For log lines and warnings: which deploy captured the message. */
export function deployContext(): string {
	return process.env.CONTEXT || 'local';
}

/**
 * The Captured sink: the whole message, on the function log — the `netlify dev`
 * terminal locally, the deploy's function log on a preview. The body goes in
 * on purpose, invite links included: a walkthrough checks what would have been
 * sent and follows the link. docs/adr/0013 says who can read the log and why
 * that is acceptable.
 */
export function capture(
	kind: 'email' | 'slack' | 'github issue',
	target: string,
	body: string,
	details?: Record<string, string | undefined>,
): void {
	console.info(
		`[${kind} captured] ${deployContext()} ${target}`,
		...(details ? [details] : []),
		`\n${body}`,
	);
}

export type EmailDelivery =
	| { mode: 'live' }
	| { mode: 'captured'; context: string }
	| { mode: 'redirected'; context: string; redirectTo: string };

/**
 * `EMAIL_REDIRECT_TO` turns Captured into Redirected: everything is delivered
 * for real, to that one address. It is read only outside production — a
 * redirect there would silently divert real applicants' mail.
 *
 * Validated as exactly one mailbox: nodemailer parses a comma- or
 * semicolon-separated `to` as multiple recipients, so a malformed value would
 * silently multi-deliver captured applicant content instead of failing
 * closed. A value that doesn't parse is treated as unset.
 */
export function emailDelivery(): EmailDelivery {
	if (isProduction()) return { mode: 'live' };

	const raw = process.env.EMAIL_REDIRECT_TO?.trim();
	if (!raw) return { mode: 'captured', context: deployContext() };

	const parsed = z.email().safeParse(raw);
	if (!parsed.success) {
		console.warn(
			`EMAIL_REDIRECT_TO is not a single valid address (${JSON.stringify(raw)}); capturing instead of redirecting.`,
		);
		return { mode: 'captured', context: deployContext() };
	}

	return {
		mode: 'redirected',
		context: deployContext(),
		redirectTo: parsed.data,
	};
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
