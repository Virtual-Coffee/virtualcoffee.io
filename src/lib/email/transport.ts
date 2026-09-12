import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Transactional mail for the membership pipeline, sent through Google
 * Workspace over SMTP as hello@virtualcoffee.io.
 *
 * SMTP AUTH rather than IP allowlisting: Netlify Functions run on Lambda with
 * no static outbound addresses, so there is nothing to allowlist. Port 587 is
 * open from that runtime.
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
 * `warning` is set when the applicant's copy went out but a cc did not. That
 * is still a success — retrying would email the applicant twice — so it is
 * reported alongside `ok`, not instead of it.
 */
export type SendResult = { ok: true; warning?: string } | SendFailure;

export function emailConfigured(): boolean {
	return Boolean(
		process.env.GOOGLE_SMTP_USER && process.env.GOOGLE_SMTP_APP_PASSWORD,
	);
}

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
	transporter ??= nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false,
		auth: {
			user: process.env.GOOGLE_SMTP_USER,
			pass: process.env.GOOGLE_SMTP_APP_PASSWORD,
		},
	});
	return transporter;
}

const TIMEOUT_CODES = new Set(['ETIMEDOUT', 'ECONNRESET', 'ESOCKET']);

export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
	if (!emailConfigured()) {
		return {
			ok: false,
			definitelyNotSent: true,
			message:
				'Email is not configured (GOOGLE_SMTP_USER / GOOGLE_SMTP_APP_PASSWORD).',
		};
	}

	const from = `Virtual Coffee <${process.env.GOOGLE_SMTP_USER}>`;

	try {
		const info = await getTransporter().sendMail({
			from,
			to: input.to,
			cc: input.cc || undefined,
			subject: input.subject,
			text: input.text,
			replyTo: process.env.GOOGLE_SMTP_USER,
		});

		// nodemailer only resolves with rejections when at least one address
		// was accepted, so a non-empty list here is a partial delivery. Whether
		// the *applicant's* copy went is what decides between failure and warning.
		const rejected = (info.rejected ?? []).map(String);
		const accepted = (info.accepted ?? []).map(String);
		if (rejected.length > 0 && !accepted.includes(input.to)) {
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
