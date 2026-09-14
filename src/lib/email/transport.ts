import nodemailer, { type Transporter } from 'nodemailer';

import {
	deliver,
	emailDelivery,
	type EmailDelivery,
	type Outbound,
} from '@/lib/outbound';

/**
 * Transactional mail for the membership pipeline, sent through Google
 * Workspace over SMTP as hello@virtualcoffee.io.
 *
 * SMTP AUTH rather than IP allowlisting: Netlify Functions run on Lambda with
 * no static outbound addresses, so there is nothing to allowlist. Port 587 is
 * open from that runtime.
 *
 * Authenticates with XOAUTH2 as a service account granted domain-wide
 * delegation over hello@ (scope `https://mail.google.com/`), so there is no
 * App Password to rotate and no consent-screen refresh token to expire.
 * `GMAIL_SERVICE_ACCOUNT_KEY` is the downloaded JSON key file, whole — its
 * `client_id` and `private_key` are what nodemailer needs. Mail-scoped on
 * purpose: the events calendar uses a different service account under
 * `GOOGLE_SERVICE_ACCOUNT_KEY`.
 *
 * Outside production nothing reaches SMTP unless `EMAIL_REDIRECT_TO` or
 * `SMTP_HOST` is set — `deliver()` decides, and only calls back here once the
 * mode is not Captured, so the credentials are never read first. `SMTP_HOST`
 * points at a local-only sink such as Mailpit instead of Gmail: no Google
 * credentials are read, mail is addressed exactly as production would address
 * it, and nothing leaves the machine. See docs/adr/0013.
 */

export type SendEmailInput = {
	to: string;
	subject: string;
	/** Both parts of one `renderEmail()` — never one without the other. */
	html: string;
	text: string;
	/** Copies the acting admin, per the "Copy me on this email" checkbox. */
	cc?: string | null;
};

export function emailConfigured(): boolean {
	return Boolean(
		process.env.SMTP_HOST ||
		(process.env.GOOGLE_SMTP_USER && process.env.GMAIL_SERVICE_ACCOUNT_KEY),
	);
}

/**
 * Netlify's UI collapses a pasted PEM onto one line inside the JSON, so
 * `\n` escapes in the key are restored — a key with literal backslash-n
 * fails signing with an opaque error.
 */
function serviceAccount(): { clientId: string; privateKey: string } | null {
	try {
		const parsed: unknown = JSON.parse(
			process.env.GMAIL_SERVICE_ACCOUNT_KEY ?? '',
		);
		if (typeof parsed !== 'object' || parsed === null) return null;
		const { client_id, private_key } = parsed as Record<string, unknown>;
		if (typeof client_id !== 'string' || typeof private_key !== 'string') {
			return null;
		}
		return {
			clientId: client_id,
			privateKey: private_key.replace(/\\n/g, '\n'),
		};
	} catch {
		return null;
	}
}

/** What the admin UI shows above the send buttons. */
export type EmailStatus = EmailDelivery & { configured: boolean };

export function emailStatus(): EmailStatus {
	return { ...emailDelivery(), configured: emailConfigured() };
}

let transporter: Transporter | undefined;
let localTransporter: Transporter | undefined;

/**
 * Pooled, so the daily accrual run reuses a connection across its sends
 * instead of a fresh connect + STARTTLS + AUTH per Volunteer, and bounded by
 * timeouts, so a hung SMTP server surfaces as a failed send rather than a
 * function that runs out of time with the rest of its work undone.
 */
export const TRANSPORT_OPTIONS = {
	host: 'smtp.gmail.com',
	port: 587,
	// Port 587 upgrades with STARTTLS; without requireTLS a stripped upgrade
	// would fall back to authenticating in cleartext.
	secure: false,
	requireTLS: true,
	pool: true,
	maxConnections: 2,
	connectionTimeout: 10_000,
	greetingTimeout: 10_000,
	socketTimeout: 30_000,
} as const;

function getTransporter(account: {
	clientId: string;
	privateKey: string;
}): Transporter {
	transporter ??= nodemailer.createTransport({
		...TRANSPORT_OPTIONS,
		auth: {
			type: 'OAuth2',
			user: process.env.GOOGLE_SMTP_USER,
			serviceClient: account.clientId,
			privateKey: account.privateKey,
		},
	});
	return transporter;
}

/**
 * A local-only SMTP sink such as Mailpit: unauthenticated, no TLS, nothing
 * else in common with `TRANSPORT_OPTIONS` — that config is Gmail-specific.
 */
function getLocalTransporter(): Transporter {
	localTransporter ??= nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT) || 1025,
		secure: false,
		ignoreTLS: true,
	});
	return localTransporter;
}

/**
 * nodemailer only resolves once the SMTP server has accepted the message, so a
 * rejected promise means it was never accepted — except a connection dropped
 * mid-DATA, which surfaces as one of these and may have stranded a message.
 */
const TIMEOUT_CODES = new Set(['ETIMEDOUT', 'ECONNRESET', 'ESOCKET']);

function isSmtpTimeout(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		TIMEOUT_CODES.has(String(error.code))
	);
}

/**
 * The address alone, lower-cased: nodemailer reports what the server accepted
 * in its own spelling, and mistaking "Name <addr>" or a capital letter for
 * "the applicant's copy was refused" would cancel and refund a send that went.
 */
function bareAddress(value: string): string {
	const match = /<([^>]+)>/.exec(value);
	return (match ? match[1] : value).trim().toLowerCase();
}

export function sendEmail(input: SendEmailInput): Promise<Outbound> {
	return deliver({
		kind: 'email',
		target: input.to,
		body: input.text,
		details: { cc: input.cc || undefined, subject: input.subject },
		unreachable: 'the mail server',
		isTimeout: isSmtpTimeout,
		live: (delivery) => send(input, delivery),
	});
}

async function send(
	input: SendEmailInput,
	delivery: Exclude<EmailDelivery, { mode: 'captured' }>,
): Promise<Outbound> {
	if (!emailConfigured()) {
		return {
			ok: false,
			definitelyNotSent: true,
			message:
				'Email is not configured (GOOGLE_SMTP_USER / GMAIL_SERVICE_ACCOUNT_KEY, or SMTP_HOST).',
		};
	}

	// Local skips Gmail entirely — there is no service account to check, and
	// GOOGLE_SMTP_USER is only cosmetic (the From address) rather than required.
	let sendingTransporter: Transporter;
	if (delivery.mode === 'local') {
		sendingTransporter = getLocalTransporter();
	} else {
		const account = serviceAccount();
		if (!account) {
			return {
				ok: false,
				definitelyNotSent: true,
				message:
					'GMAIL_SERVICE_ACCOUNT_KEY is not a service account key file (expected JSON with client_id and private_key).',
			};
		}
		sendingTransporter = getTransporter(account);
	}

	const from = `Virtual Coffee <${process.env.GOOGLE_SMTP_USER || 'dev@localhost'}>`;

	// Redirected: one address gets everything, the intended recipient is named
	// in the subject and a header, and no cc — the point is that only the
	// maintainer who set EMAIL_REDIRECT_TO receives anything. Local addresses
	// exactly as Live would: the point of a local sink is seeing what
	// production would actually send.
	const to = delivery.mode === 'redirected' ? delivery.redirectTo : input.to;
	const cc = delivery.mode === 'redirected' ? undefined : input.cc || undefined;
	const subject =
		delivery.mode === 'redirected'
			? `[to: ${input.to}] ${input.subject}`
			: input.subject;

	const info = await sendingTransporter.sendMail({
		from,
		to,
		cc,
		subject,
		html: input.html,
		text: input.text,
		replyTo: process.env.GOOGLE_SMTP_USER || undefined,
		...(delivery.mode === 'redirected'
			? { headers: { 'X-Original-To': input.to } }
			: {}),
	});

	// nodemailer only resolves with rejections when at least one address
	// was accepted, so a non-empty list here is a partial delivery. Whether
	// the *applicant's* copy went is what decides between failure and warning.
	const rejected = (info.rejected ?? []).map(String);
	const accepted = (info.accepted ?? []).map(String).map(bareAddress);
	if (rejected.length > 0 && !accepted.includes(bareAddress(to))) {
		return {
			ok: false,
			definitelyNotSent: true,
			message: `The mail server rejected ${rejected.join(', ')}.`,
		};
	}
	if (rejected.length > 0) {
		return {
			ok: true,
			message: 'Sent.',
			warning: `Sent, but the copy to ${rejected.join(', ')} was rejected.`,
		};
	}

	if (delivery.mode === 'redirected') {
		return {
			ok: true,
			message: 'Sent.',
			warning: `Redirected to ${delivery.redirectTo} (${delivery.context}) instead of ${input.to}.`,
		};
	}
	if (delivery.mode === 'local') {
		return {
			ok: true,
			message: 'Sent.',
			warning: `Sent to local SMTP sink at ${process.env.SMTP_HOST}:${Number(process.env.SMTP_PORT) || 1025} (${delivery.context}) — not delivered outside this machine.`,
		};
	}
	return { ok: true, message: 'Sent.' };
}
