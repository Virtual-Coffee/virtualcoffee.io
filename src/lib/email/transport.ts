import nodemailer, { type Transporter } from 'nodemailer';

import {
	capture,
	emailDelivery,
	maskAddress,
	type EmailDelivery,
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
 * Outside production nothing reaches SMTP unless `SMTP_HOST` is set —
 * `emailDelivery()` decides, and `sendEmail` consults it before it so much as
 * reads the credentials. `SMTP_HOST` points at a local-only sink such as
 * Mailpit instead of Gmail: no Google credentials are read, mail is addressed
 * exactly as production would address it, and nothing leaves the machine.
 * See docs/adr/0013.
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

/**
 * Whether a failure definitely means nothing was delivered.
 *
 * This distinction is load-bearing rather than cosmetic: the admin UI promises
 * "nothing was emailed — safe to try again", and a maintainer decides whether
 * to retry based on it. Getting it wrong double-emails an applicant.
 *
 * nodemailer only resolves once the SMTP server has accepted the message, so a
 * rejected promise means it was never accepted. The one case we cannot claim
 * certainty about is a connection dropped mid-DATA, which surfaces as a
 * timeout.
 */
export type SendFailure = {
	ok: false;
	definitelyNotSent: boolean;
	message: string;
};

/**
 * `warning` is set when the send succeeded but not as asked: the applicant's
 * copy went out but a cc did not, or the message was Captured or sent Local
 * on a non-production deploy. Each is still a success — retrying
 * would email the applicant twice — so it is reported alongside `ok`, not
 * instead of it.
 */
export type SendResult = { ok: true; warning?: string } | SendFailure;

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
	secure: false,
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

const TIMEOUT_CODES = new Set(['ETIMEDOUT', 'ECONNRESET', 'ESOCKET']);

/**
 * The address alone, lower-cased: nodemailer reports what the server accepted
 * in its own spelling, and mistaking "Name <addr>" or a capital letter for
 * "the applicant's copy was refused" would cancel and refund a send that went.
 */
function bareAddress(value: string): string {
	const match = /<([^>]+)>/.exec(value);
	return (match ? match[1] : value).trim().toLowerCase();
}

export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
	const delivery = emailDelivery();

	if (delivery.mode === 'captured') {
		// The cc is the acting maintainer's address; masked wherever it is
		// logged, since a deploy's log names nobody (docs/adr/0013).
		capture('email', input.to, input.text, {
			cc: input.cc ? maskAddress(input.cc) : undefined,
			subject: input.subject,
		});
		return {
			ok: true,
			warning: `Captured, not delivered (${delivery.context}): nothing leaves this deploy.`,
		};
	}

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

	// Local addresses exactly as Live would: the point of a local sink is
	// seeing what production would actually send.
	const to = input.to;
	const cc = input.cc || undefined;

	try {
		const info = await sendingTransporter.sendMail({
			from,
			to,
			cc,
			subject: input.subject,
			html: input.html,
			text: input.text,
			replyTo: process.env.GOOGLE_SMTP_USER || undefined,
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
				warning: `Sent, but the copy to ${rejected.join(', ')} was rejected.`,
			};
		}

		if (delivery.mode === 'local') {
			return {
				ok: true,
				warning: `Sent to local SMTP sink at ${process.env.SMTP_HOST}:${Number(process.env.SMTP_PORT) || 1025} (${delivery.context}) — not delivered outside this machine.`,
			};
		}
		return { ok: true };
	} catch (error) {
		const code =
			typeof error === 'object' && error !== null && 'code' in error
				? String((error as { code: unknown }).code)
				: '';

		return {
			ok: false,
			// A timeout can strand a message that the server had already begun
			// accepting, so don't promise it wasn't delivered.
			definitelyNotSent: !TIMEOUT_CODES.has(code),
			message:
				error instanceof Error ? error.message : 'The mail server errored.',
		};
	}
}
