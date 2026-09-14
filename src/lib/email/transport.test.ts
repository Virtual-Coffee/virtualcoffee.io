import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const sendMail = vi.hoisted(() => vi.fn());
const createTransport = vi.hoisted(() => vi.fn(() => ({ sendMail })));

vi.mock('nodemailer', () => ({ default: { createTransport } }));

import {
	emailConfigured,
	emailStatus,
	sendEmail,
	TRANSPORT_OPTIONS,
} from './transport';

const input = {
	to: 'ada@example.test',
	subject: 'Hello',
	html: '<p>Body</p>',
	text: 'Body',
};

/** The shape of a downloaded service-account key file, PEM collapsed as Netlify's UI does. */
const KEY = JSON.stringify({
	type: 'service_account',
	client_id: '113600000000000000000',
	client_email: 'mail@vc.iam.gserviceaccount.com',
	private_key:
		'-----BEGIN PRIVATE KEY-----\\nMIIE\\n-----END PRIVATE KEY-----\\n',
});

beforeEach(() => {
	// Live delivery is production only; every case below is about what a
	// live send does. The non-production modes have their own describe.
	vi.stubEnv('CONTEXT', 'production');
	vi.stubEnv('GOOGLE_SMTP_USER', 'hello@virtualcoffee.io');
	vi.stubEnv('GMAIL_SERVICE_ACCOUNT_KEY', KEY);
	sendMail.mockReset();
	sendMail.mockResolvedValue({ rejected: [] });
});

afterEach(() => vi.unstubAllEnvs());

describe('emailConfigured', () => {
	test('needs both the user and the service account key', () => {
		expect(emailConfigured()).toBe(true);
		vi.stubEnv('GMAIL_SERVICE_ACCOUNT_KEY', undefined);
		expect(emailConfigured()).toBe(false);
	});
});

describe('sendEmail', () => {
	test('sends as hello@ with hello@ as Reply-To, and no cc when none was asked for', async () => {
		await expect(sendEmail({ ...input, cc: null })).resolves.toEqual({
			ok: true,
		});
		expect(sendMail).toHaveBeenCalledWith({
			from: 'Virtual Coffee <hello@virtualcoffee.io>',
			to: input.to,
			cc: undefined,
			subject: input.subject,
			html: input.html,
			text: input.text,
			replyTo: 'hello@virtualcoffee.io',
		});
		// The transporter is a module singleton, built on this first send:
		// XOAUTH2 as the service account impersonating hello@, with the PEM's
		// collapsed newlines restored.
		expect(createTransport).toHaveBeenCalledWith(
			expect.objectContaining({
				auth: {
					type: 'OAuth2',
					user: 'hello@virtualcoffee.io',
					serviceClient: '113600000000000000000',
					privateKey:
						'-----BEGIN PRIVATE KEY-----\nMIIE\n-----END PRIVATE KEY-----\n',
				},
			}),
		);
	});

	test.each(['not json', '{"client_id":"x"}', '[]'])(
		'a key that is not a service account file (%s) is definitely not sent',
		async (key) => {
			vi.stubEnv('GMAIL_SERVICE_ACCOUNT_KEY', key);
			await expect(sendEmail(input)).resolves.toMatchObject({
				ok: false,
				definitelyNotSent: true,
				message: expect.stringContaining('not a service account key file'),
			});
			expect(sendMail).not.toHaveBeenCalled();
		},
	);

	test('the transport is pooled and every phase has a timeout', () => {
		// The transporter is a module singleton, so the options are asserted
		// directly rather than off a createTransport call some earlier test made.
		expect(TRANSPORT_OPTIONS).toMatchObject({
			pool: true,
			connectionTimeout: expect.any(Number),
			greetingTimeout: expect.any(Number),
			socketTimeout: expect.any(Number),
		});
	});

	test('copies the acting admin when asked', async () => {
		await sendEmail({ ...input, cc: 'maintainer@example.test' });
		expect(sendMail).toHaveBeenLastCalledWith(
			expect.objectContaining({ cc: 'maintainer@example.test' }),
		);
	});

	/**
	 * `definitelyNotSent` is what the admin UI turns into "nothing was emailed
	 * — safe to try again". Every branch below is a promise to a maintainer.
	 */
	test('unconfigured: definitely not sent, and no transport is even built', async () => {
		vi.stubEnv('GOOGLE_SMTP_USER', undefined);
		const before = createTransport.mock.calls.length;

		await expect(sendEmail(input)).resolves.toMatchObject({
			ok: false,
			definitelyNotSent: true,
			message: expect.stringContaining('not configured'),
		});
		expect(createTransport.mock.calls.length).toBe(before);
		expect(sendMail).not.toHaveBeenCalled();
	});

	test('a rejected recipient: definitely not sent, naming the address', async () => {
		sendMail.mockResolvedValue({
			accepted: ['maintainer@example.test'],
			rejected: ['ada@example.test'],
		});
		await expect(sendEmail(input)).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'The mail server rejected ada@example.test.',
		});
	});

	/**
	 * The applicant's copy went; only the maintainer's cc bounced. Calling that
	 * "nothing was emailed" would have the maintainer retry and email the
	 * applicant twice — the exact outcome definitelyNotSent exists to prevent.
	 */
	test('a rejected cc with the applicant accepted is a success with a warning', async () => {
		sendMail.mockResolvedValue({
			accepted: ['ada@example.test'],
			rejected: ['maintainer@example.test'],
		});
		await expect(
			sendEmail({ ...input, cc: 'maintainer@example.test' }),
		).resolves.toEqual({
			ok: true,
			warning: 'Sent, but the copy to maintainer@example.test was rejected.',
		});
	});

	test('the applicant is matched by address, not by spelling', async () => {
		sendMail.mockResolvedValue({
			accepted: ['Ada <ADA@example.test>'],
			rejected: ['maintainer@example.test'],
		});
		await expect(
			sendEmail({ ...input, cc: 'maintainer@example.test' }),
		).resolves.toMatchObject({ ok: true });
	});

	test.each(['EAUTH', 'EENVELOPE', 'ECONNECTION', undefined])(
		'an error with code %s: definitely not sent',
		async (code) => {
			sendMail.mockRejectedValue(Object.assign(new Error('boom'), { code }));
			await expect(sendEmail(input)).resolves.toEqual({
				ok: false,
				definitelyNotSent: true,
				message: 'boom',
			});
		},
	);

	test.each(['ETIMEDOUT', 'ECONNRESET', 'ESOCKET'])(
		'a %s may have stranded a message the server had begun accepting',
		async (code) => {
			sendMail.mockRejectedValue(Object.assign(new Error('late'), { code }));
			await expect(sendEmail(input)).resolves.toEqual({
				ok: false,
				definitelyNotSent: false,
				message: 'late',
			});
		},
	);

	test('a non-Error rejection still comes back as a result', async () => {
		sendMail.mockRejectedValue('nope');
		await expect(sendEmail(input)).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'The mail server errored.',
		});
	});
});

/**
 * Outside production the credentials are irrelevant: Captured never touches
 * them, and Local sends past them to a sink. docs/adr/0013.
 */
describe('delivery modes', () => {
	test('captured: no transport, no send, and a success the pipeline proceeds on', async () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		const before = createTransport.mock.calls.length;

		await expect(
			sendEmail({ ...input, cc: 'maintainer@example.test' }),
		).resolves.toEqual({
			ok: true,
			warning:
				'Captured, not delivered (deploy-preview): nothing leaves this deploy.',
		});
		expect(createTransport.mock.calls.length).toBe(before);
		expect(sendMail).not.toHaveBeenCalled();
		// On a deploy the applicant's address is masked and the body is not
		// logged — `outbound.test.ts` has the shape; this pins that email uses it.
		expect(info).toHaveBeenCalledWith(
			'[email captured] deploy-preview a•••@example.test',
			{ cc: 'maintainer@example.test', subject: input.subject },
		);
		info.mockRestore();
	});

	test('captured even when nothing is configured, and locally with no CONTEXT at all', async () => {
		vi.stubEnv('CONTEXT', undefined);
		vi.stubEnv('GOOGLE_SMTP_USER', undefined);
		vi.spyOn(console, 'info').mockImplementation(() => {});

		await expect(sendEmail(input)).resolves.toMatchObject({
			ok: true,
			warning: expect.stringContaining('(local)'),
		});
		expect(sendMail).not.toHaveBeenCalled();
	});

	test('local: no Google credentials needed, addressed exactly as production would', async () => {
		vi.stubEnv('CONTEXT', 'dev');
		vi.stubEnv('SMTP_HOST', 'localhost');
		vi.stubEnv('SMTP_PORT', '1025');
		vi.stubEnv('GOOGLE_SMTP_USER', undefined);
		vi.stubEnv('GMAIL_SERVICE_ACCOUNT_KEY', undefined);

		await expect(
			sendEmail({ ...input, cc: 'maintainer@example.test' }),
		).resolves.toEqual({
			ok: true,
			warning:
				'Sent to local SMTP sink at localhost:1025 (dev) — not delivered outside this machine.',
		});
		expect(sendMail).toHaveBeenCalledWith({
			from: 'Virtual Coffee <dev@localhost>',
			to: input.to,
			cc: 'maintainer@example.test',
			subject: input.subject,
			html: input.html,
			text: input.text,
			replyTo: undefined,
		});
		expect(createTransport).toHaveBeenLastCalledWith({
			host: 'localhost',
			port: 1025,
			secure: false,
			ignoreTLS: true,
		});
	});

	test('local defaults SMTP_PORT to 1025', async () => {
		// The local transporter is a module singleton like the Gmail one, so this
		// asserts on the warning (built fresh every call) rather than a
		// createTransport call an earlier test may already have made.
		vi.stubEnv('CONTEXT', 'dev');
		vi.stubEnv('SMTP_HOST', 'localhost');
		vi.stubEnv('SMTP_PORT', undefined);

		await expect(sendEmail(input)).resolves.toMatchObject({
			ok: true,
			warning: expect.stringContaining('localhost:1025'),
		});
	});

	test('SMTP_HOST is ignored in production', async () => {
		vi.stubEnv('SMTP_HOST', 'localhost');
		await expect(sendEmail(input)).resolves.toEqual({ ok: true });
		expect(sendMail).toHaveBeenLastCalledWith(
			expect.objectContaining({
				from: 'Virtual Coffee <hello@virtualcoffee.io>',
				to: input.to,
			}),
		);
	});
});

describe('emailStatus', () => {
	test('reports the mode and whether credentials exist, separately', () => {
		expect(emailStatus()).toEqual({ mode: 'live', configured: true });

		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('GOOGLE_SMTP_USER', undefined);
		expect(emailStatus()).toEqual({
			mode: 'captured',
			context: 'deploy-preview',
			configured: false,
		});

		vi.stubEnv('SMTP_HOST', 'localhost');
		expect(emailStatus()).toEqual({
			mode: 'local',
			context: 'deploy-preview',
			configured: true,
		});
	});
});
