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
 *
 * Every sender is a `deliver()` call: it hands over the message and a `live`
 * callback, and this module decides the mode, captures, catches, and shapes
 * the `Outbound` result. A sender cannot reach its credentials before the mode.
 */

export type DeliveryMode = 'live' | 'captured' | 'redirected';

export type OutboundKind = 'email' | 'slack' | 'github issue';

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
	kind: OutboundKind,
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

/**
 * What a send came to, in a sentence — `message` is recorded as the event
 * body either way. `warning` is set when it succeeded but not as asked
 * (Captured, Redirected, a cc rejected): still a success, since retrying
 * would send twice, so it sits alongside `ok` rather than instead of it.
 *
 * `definitelyNotSent` is load-bearing: the admin UI promises "nothing was
 * emailed — safe to try again" on it, and a maintainer retries on that
 * promise. A timeout may have stranded a message the server had begun
 * accepting, so a timeout never claims it.
 *
 * `Extra` is what a success carries beyond the shared shape — a GitHub
 * issue's `url`, say — and the sender declares its Captured value for it.
 */
export type Outbound<Extra extends object = Record<never, never>> =
	| ({ ok: true; message: string; warning?: string } & Extra)
	| { ok: false; message: string; definitelyNotSent: boolean };

/** The non-captured mode handed to `live`: email's variant, `{ mode: 'live' }` for the rest. */
export type LiveDelivery<K extends OutboundKind> = K extends 'email'
	? Exclude<EmailDelivery, { mode: 'captured' }>
	: { mode: 'live' };

type Delivery<K extends OutboundKind> =
	{ mode: 'captured'; context: string } | LiveDelivery<K>;

function deliveryFor<K extends OutboundKind>(kind: K): Delivery<K> {
	if (kind === 'email') return emailDelivery() as Delivery<K>;
	return (
		notifyDelivery() === 'captured'
			? { mode: 'captured', context: deployContext() }
			: { mode: 'live' }
	) as Delivery<K>;
}

const VERB: Record<OutboundKind, string> = {
	email: 'delivered',
	slack: 'posted to Slack',
	'github issue': 'opened on GitHub',
};

/** `AbortSignal.timeout()` rejects with a DOMException named TimeoutError. */
function isAbortTimeout(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'name' in error &&
		error.name === 'TimeoutError'
	);
}

/**
 * Send something, or Capture it: the one seam every sender goes through.
 * Never throws — the caller has usually already committed a row and records
 * the outcome either way (docs/adr/0005).
 */
export async function deliver<
	K extends OutboundKind,
	Extra extends object = Record<never, never>,
>(input: {
	kind: K;
	/** Recipient, channel or repository — what the Captured log line names. */
	target: string;
	/** What `capture()` logs. */
	body: string;
	details?: Record<string, string | undefined>;
	/** Noun for "Could not reach X" when `live` throws. */
	unreachable: string;
	/** The `Extra` fields a Captured success carries. */
	captured?: Extra;
	/** Defaults to an `AbortSignal.timeout()`; nodemailer has its own codes. */
	isTimeout?: (error: unknown) => boolean;
	live: (delivery: LiveDelivery<K>) => Promise<Outbound<NoInfer<Extra>>>;
}): Promise<Outbound<Extra>> {
	const delivery = deliveryFor(input.kind);

	if (delivery.mode === 'captured') {
		capture(input.kind, input.target, input.body, input.details);
		const message = `Captured, not ${VERB[input.kind]} (${delivery.context}).`;
		return {
			ok: true,
			message,
			warning: message,
			...(input.captured ?? ({} as Extra)),
		};
	}

	try {
		return await input.live(delivery);
	} catch (error) {
		return {
			ok: false,
			message:
				error instanceof Error
					? `Could not reach ${input.unreachable}: ${error.message}`
					: `Could not reach ${input.unreachable}.`,
			definitelyNotSent: !(input.isTimeout ?? isAbortTimeout)(error),
		};
	}
}
