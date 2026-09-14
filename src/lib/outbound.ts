/**
 * Delivery Mode for anything the site sends out — email, Slack posts and DMs,
 * GitHub issues. Live delivery is production only; everywhere else is Captured
 * (built and logged, the caller carries on as though it went) unless an opt-in
 * says otherwise — and a Slack DM has no opt-in. Email's opt-in is Local
 * (`SMTP_HOST`, a local-only sink such as Mailpit). See docs/adr/0013.
 *
 * `CONTEXT` is Netlify's: `production`, `deploy-preview`, `branch-deploy`, or
 * `dev` under `netlify dev`. Plain `next dev` has none, which is non-production
 * too — the rule is "production or not", never "deployed or not".
 *
 * Every sender is a `deliver()` call: it hands over the message and a `live`
 * callback, and this module decides the mode, captures, catches, and shapes
 * the `Outbound` result. A sender cannot reach its credentials before the mode.
 */

export type OutboundKind = 'email' | 'slack' | 'slack dm' | 'github issue';

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
	kind: OutboundKind,
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
 * address is involved.
 */
export function emailDelivery(): EmailDelivery {
	if (isProduction()) return { mode: 'live' };

	if (process.env.SMTP_HOST?.trim()) {
		return { mode: 'local', context: deployContext() };
	}
	return { mode: 'captured', context: deployContext() };
}

/**
 * Slack posts and GitHub issues have no address to redirect to; their opt-in
 * is `NOTIFY_LIVE_OUTSIDE_PRODUCTION=true`, paired with per-context webhook
 * and App values that point at a test channel or repository.
 */
export function notifyDelivery(): 'live' | 'captured' {
	if (isProduction()) return 'live';
	return process.env.NOTIFY_LIVE_OUTSIDE_PRODUCTION === 'true'
		? 'live'
		: 'captured';
}

/**
 * A Slack DM is addressed to a stored member id, and on a preview that is a
 * real person (docs/adr/0007) — there is no test channel to point it at, so
 * no variable opts it in.
 */
function dmDelivery(): 'live' | 'captured' {
	return isProduction() ? 'live' : 'captured';
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
	const mode = kind === 'slack dm' ? dmDelivery() : notifyDelivery();
	return (
		mode === 'captured'
			? { mode: 'captured', context: deployContext() }
			: { mode: 'live' }
	) as Delivery<K>;
}

const VERB: Record<OutboundKind, string> = {
	email: 'delivered',
	slack: 'posted to Slack',
	'slack dm': 'sent as a Slack DM',
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
