import nodemailer, { type Transporter } from 'nodemailer';

import { emailDelivery, type EmailDelivery } from '@/lib/outbound';

/**
 * Transactional mail for the membership pipeline, sent through Google
 * Workspace over SMTP as hello@virtualcoffee.io.
 *
 * SMTP AUTH rather than IP allowlisting: Netlify Functions run on Lambda with
 * no static outbound addresses, so there is nothing to allowlist. Port 587 is
 * open from that runtime.
 *
 * Outside production nothing reaches SMTP unless `EMAIL_REDIRECT_TO` is set —
 * `emailDelivery()` decides, and `sendEmail` consults it before it so much as
 * reads the credentials. See docs/adr/0013.
 */

export type SendEmailInput = {
	to: string;
	subject: string;
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
 * copy went out but a cc did not, or the message was Captured or Redirected
 * on a non-production deploy. Each is still a success — retrying would email
 * the applicant twice — so it is reported alongside `ok`, not instead of it.
 */
export type SendResult = { ok: true; warning?: string } | SendFailure;

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
	secure: false,
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

/**
 * The Captured sink: the whole message, on the function log. Locally that is
 * the `netlify dev` terminal; on a preview, the deploy's function log.
 */
function capture(input: SendEmailInput, context: string): void {
	console.info(
		`[email captured] ${context}`,
		{ to: input.to, cc: input.cc || undefined, subject: input.subject },
		`\n${input.text}`,
	);
}

export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
	const delivery = emailDelivery();

	if (delivery.mode === 'captured') {
		capture(input, delivery.context);
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

	try {
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
				warning: `Sent, but the copy to ${rejected.join(', ')} was rejected.`,
			};
		}

		if (delivery.mode === 'redirected') {
			return {
				ok: true,
				warning: `Redirected to ${delivery.redirectTo} (${delivery.context}) instead of ${input.to}.`,
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
