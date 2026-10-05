/**
 * Delivery Mode for everything the site sends, Events Calendar writes
 * included: Live on production only,
 * Captured everywhere else unless an opt-in says otherwise, and email's Local
 * opt-in (`SMTP_HOST`) only on a checkout (docs/adr/0013). Every sender is a
 * `deliver()` call, so it cannot reach its credentials before the mode is
 * decided. Plain `next dev` has no `CONTEXT` at all, and counts as a
 * checkout, like `netlify dev`'s `CONTEXT=dev`.
 */

import { contextLabel, deployContext } from '@/lib/deployContext';
import { maskAddress } from '@/lib/maskAddress';
import { reportHandled } from '@/lib/monitoring/reportHandled';

export type OutboundKind =
	'email' | 'slack' | 'slack dm' | 'github issue' | 'calendar';

/**
 * Every link in a message, so a walkthrough can see where it went. A `code`
 * is a live invite (`/join-slack?code=`), so its value never reaches the log.
 */
export function linksIn(body: string): string[] {
	const links = (body.match(/https?:\/\/[^\s<>"')]+/g) ?? []).map((link) =>
		// A link at the end of a sentence carries the full stop with it.
		withoutCode(link.replace(/[.,;:!?]+$/, '')),
	);
	return [...new Set(links)];
}

function withoutCode(link: string): string {
	const url = URL.parse(link);
	if (!url?.searchParams.has('code')) return link;
	return `${url.origin}${url.pathname}?code=…`;
}

/**
 * The Captured sink is the function log. Locally the whole message goes in; on
 * a deploy only the masked recipient, the subject and the links, because the
 * message is about a real person (docs/adr/0007, docs/adr/0013).
 */
export function capture(
	kind: OutboundKind,
	target: string,
	body: string,
	details?: Record<string, string | undefined>,
): void {
	if (deployContext() !== 'local') {
		console.info(
			`[${kind} captured] ${contextLabel()} ${maskAddress(target)}`,
			...(details ? [details] : []),
			...linksIn(body).map((link) => `\n${link}`),
		);
		return;
	}

	console.info(
		`[${kind} captured] ${contextLabel()} ${target}`,
		...(details ? [details] : []),
		...(body ? [`\n${body}`] : []),
	);
}

export type EmailDelivery =
	| { mode: 'live' }
	| { mode: 'captured'; context: string }
	| { mode: 'local'; context: string; host: string };

/**
 * `SMTP_HOST` turns Captured into Local: delivered for real, exactly as
 * production would address it, to a local-only SMTP sink such as Mailpit — no
 * Google credentials needed. It never leaves the machine, so no redirect
 * address is involved. Only a checkout honours it: on a deploy the same
 * variable would name a host that real applicants' mail can reach, so a
 * preview stays Captured whatever is set.
 */
export function emailDelivery(): EmailDelivery {
	if (deployContext() === 'production') return { mode: 'live' };

	const host = process.env.SMTP_HOST?.trim();
	if (deployContext() === 'local' && host) {
		if (isLoopbackHost(host)) {
			return { mode: 'local', context: contextLabel(), host };
		}
		// A sink that mail can leave the machine for is not a sink.
		console.warn(
			`[email captured] SMTP_HOST=${host} is not a loopback address; nothing is delivered outside production.`,
		);
	}
	return { mode: 'captured', context: contextLabel() };
}

function isLoopbackHost(host: string): boolean {
	const bare = host.toLowerCase().replace(/^\[(.*)\]$/, '$1');
	return bare === 'localhost' || bare === '127.0.0.1' || bare === '::1';
}

/**
 * Senders with no address to redirect to share one opt-in shape: an env var
 * set to `true` makes them Live outside production, paired with per-context
 * values that point somewhere safe.
 *
 * - `NOTIFY_LIVE_OUTSIDE_PRODUCTION` — Slack posts and GitHub issues, with
 *   webhook and App values for a test channel or repository.
 * - `CALENDAR_LIVE_OUTSIDE_PRODUCTION` — Events Calendar writes
 *   (`/admin/events`), with a `GOOGLE_CALENDAR_ID` naming a scratch calendar
 *   the service account can edit. Reads are never gated.
 */
function optInDelivery(envVar: string): 'live' | 'captured' {
	if (deployContext() === 'production') return 'live';
	return process.env[envVar] === 'true' ? 'live' : 'captured';
}

/**
 * A Slack DM is addressed to a stored member id, and on a preview that is a
 * real person (docs/adr/0007) — there is no test channel to point it at, so
 * no variable opts it in.
 */
function dmDelivery(): 'live' | 'captured' {
	return deployContext() === 'production' ? 'live' : 'captured';
}

/**
 * What a send came to, in a sentence — `message` is recorded as the event
 * body either way. `warning` is set when it succeeded but not as asked
 * (Captured, Local, a cc rejected): still a success, since retrying
 * would send twice, so it sits alongside `ok` rather than instead of it.
 *
 * `definitelyNotSent` is load-bearing: the admin UI promises "nothing was
 * emailed — safe to try again" on it, and a maintainer retries on that
 * promise. A timeout may have stranded a message the server had begun
 * accepting, so a timeout never claims it.
 *
 * `Extra` is what a success carries beyond the shared shape — a GitHub
 * issue's `url`, say — and the sender declares its Captured value for it.
 *
 * `report: false` is a sender saying nobody has to fix this failure (a busy
 * service, an edit race, a rejected recipient), so `deliver()` keeps it out
 * of Sentry (docs/adr/0015).
 */
export type Outbound<Extra extends object = Record<never, never>> =
	| ({ ok: true; message: string; warning?: string } & Extra)
	| { ok: false; message: string; definitelyNotSent: boolean; report?: false };

/** The non-captured mode handed to `live`: email's variant, `{ mode: 'live' }` for the rest. */
export type LiveDelivery<K extends OutboundKind> = K extends 'email'
	? Exclude<EmailDelivery, { mode: 'captured' }>
	: { mode: 'live' };

type Delivery<K extends OutboundKind> =
	{ mode: 'captured'; context: string } | LiveDelivery<K>;

function deliveryFor<K extends OutboundKind>(kind: K): Delivery<K> {
	if (kind === 'email') return emailDelivery() as Delivery<K>;
	const mode =
		kind === 'slack dm'
			? dmDelivery()
			: optInDelivery(
					kind === 'calendar'
						? 'CALENDAR_LIVE_OUTSIDE_PRODUCTION'
						: 'NOTIFY_LIVE_OUTSIDE_PRODUCTION',
				);
	return (
		mode === 'captured'
			? { mode: 'captured', context: contextLabel() }
			: { mode: 'live' }
	) as Delivery<K>;
}

const VERB: Record<OutboundKind, string> = {
	email: 'delivered',
	slack: 'posted to Slack',
	'slack dm': 'sent as a Slack DM',
	'github issue': 'opened on GitHub',
	calendar: 'written to the Events Calendar',
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

	const report = (error: unknown) =>
		reportHandled(error, {
			area: 'outbound',
			tags: { outbound: input.kind, target: maskAddress(input.target) },
		});

	let result: Outbound<Extra>;
	try {
		result = await input.live(delivery);
	} catch (error) {
		const timedOut = (input.isTimeout ?? isAbortTimeout)(error);
		if (!timedOut && isActionable(error)) report(error);
		return {
			ok: false,
			message:
				error instanceof Error
					? `Could not reach ${input.unreachable}: ${error.message}`
					: `Could not reach ${input.unreachable}.`,
			definitelyNotSent: !timedOut,
		};
	}

	// A sender's own refusal: a missing env var, a rejected webhook.
	if (!result.ok && result.definitelyNotSent && result.report !== false) {
		report(new Error(result.message));
	}
	return result;
}

/**
 * A rejection someone has to fix (a 4xx: bad credentials, a missing
 * installation) or a failure with no status at all. A 429, a 5xx or a timeout
 * is the other side's weather, and History already shows it (docs/adr/0015).
 */
function isActionable(error: unknown): boolean {
	const status = httpStatus(error);
	if (status === undefined) return true;
	return status >= 400 && status < 500 && status !== 429;
}

/**
 * Octokit sets `status`; Google's clients use `code` or `response.status`.
 * Only 100-599 counts: a DOMException's numeric `code` (0 for the DataError
 * a malformed private key throws) is not an HTTP status.
 */
function httpStatus(error: unknown): number | undefined {
	if (typeof error !== 'object' || error === null) return;
	const { status, code, response } = error as {
		status?: unknown;
		code?: unknown;
		response?: { status?: unknown };
	};
	return [status, response?.status, code].find(
		(value): value is number =>
			typeof value === 'number' && value >= 100 && value < 600,
	);
}
