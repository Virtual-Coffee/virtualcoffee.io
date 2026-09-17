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
 * Outside production nothing reaches SMTP unless `EMAIL_REDIRECT_TO` is set —
 * `deliver()` decides, and only calls back here once the mode is not
 * Captured, so the credentials are never read first. See docs/adr/0013.
 */

export type SendEmailInput = {
	to: string;
	subject: string;
	text: string;
	/** Copies the acting admin, per the "Copy me on this email" checkbox. */
	cc?: string | null;
};

export function emailConfigured(): boolean {
	return Boolean(
		process.env.GOOGLE_SMTP_USER && process.env.GOOGLE_SMTP_APP_PASSWORD,
	);
}

/** What the admin UI shows above the send buttons. */
export type EmailStatus = EmailDelivery & { configured: boolean };

export function emailStatus(): EmailStatus {
	return { ...emailDelivery(), configured: emailConfigured() };
}

let transporter: Transporter | undefined;

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

function getTransporter(): Transporter {
	transporter ??= nodemailer.createTransport({
		...TRANSPORT_OPTIONS,
		auth: {
			user: process.env.GOOGLE_SMTP_USER,
			pass: process.env.GOOGLE_SMTP_APP_PASSWORD,
		},
	});
	return transporter;
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
				'Email is not configured (GOOGLE_SMTP_USER / GOOGLE_SMTP_APP_PASSWORD).',
		};
	}

	const from = `Virtual Coffee <${process.env.GOOGLE_SMTP_USER}>`;

	// Redirected: one address gets everything, the intended recipient is named
	// in the subject and a header, and no cc — the point is that only the
	// maintainer who set EMAIL_REDIRECT_TO receives anything.
	const to = delivery.mode === 'redirected' ? delivery.redirectTo : input.to;
	const cc = delivery.mode === 'redirected' ? undefined : input.cc || undefined;
	const subject =
		delivery.mode === 'redirected'
			? `[to: ${input.to}] ${input.subject}`
			: input.subject;

	const info = await getTransporter().sendMail({
		from,
		to,
		cc,
		subject,
		text: input.text,
		replyTo: process.env.GOOGLE_SMTP_USER,
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
	return { ok: true, message: 'Sent.' };
}
