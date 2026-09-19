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
	text: 'Body',
};

beforeEach(() => {
	// Live delivery is production only; every case below is about what a
	// live send does. The non-production modes have their own describe.
	vi.stubEnv('CONTEXT', 'production');
	vi.stubEnv('EMAIL_REDIRECT_TO', undefined);
	vi.stubEnv('GOOGLE_SMTP_USER', 'hello@virtualcoffee.io');
	vi.stubEnv('GOOGLE_SMTP_APP_PASSWORD', 'app-password');
	sendMail.mockReset();
	sendMail.mockResolvedValue({ rejected: [] });
});

afterEach(() => vi.unstubAllEnvs());

describe('emailConfigured', () => {
	test('needs both the user and the app password', () => {
		expect(emailConfigured()).toBe(true);
		vi.stubEnv('GOOGLE_SMTP_APP_PASSWORD', undefined);
		expect(emailConfigured()).toBe(false);
	});
});

describe('sendEmail', () => {
	test('sends as hello@ with hello@ as Reply-To, and no cc when none was asked for', async () => {
		await expect(sendEmail({ ...input, cc: null })).resolves.toEqual({
			ok: true,
			message: 'Sent.',
		});
		expect(sendMail).toHaveBeenCalledWith({
			from: 'Virtual Coffee <hello@virtualcoffee.io>',
			to: input.to,
			cc: undefined,
			subject: input.subject,
			text: input.text,
			replyTo: 'hello@virtualcoffee.io',
		});
	});

	test('the transport is pooled and every phase has a timeout', () => {
		// The transporter is a module singleton, so the options are asserted
		// directly rather than off a createTransport call some earlier test made.
		expect(TRANSPORT_OPTIONS).toMatchObject({
			secure: false,
			requireTLS: true,
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
			message: 'Sent.',
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
				message: 'Could not reach the mail server: boom',
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
				message: 'Could not reach the mail server: late',
			});
		},
	);
});

/**
 * Outside production the credentials are irrelevant: Captured never touches
 * them, and Redirected uses them to reach one maintainer. docs/adr/0013.
 */
describe('delivery modes', () => {
	test('captured: the credentials are never read, no transport is built, and the pipeline proceeds', async () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('GOOGLE_SMTP_USER', undefined);
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		const before = createTransport.mock.calls.length;

		await expect(
			sendEmail({ ...input, cc: 'maintainer@example.test' }),
		).resolves.toMatchObject({
			ok: true,
			warning: 'Captured, not delivered (deploy-preview).',
		});
		expect(createTransport.mock.calls.length).toBe(before);
		expect(sendMail).not.toHaveBeenCalled();
		expect(info).toHaveBeenCalledWith(
			`[email captured] deploy-preview ${input.to}`,
			{ cc: 'maintainer@example.test', subject: input.subject },
			`\n${input.text}`,
		);
		info.mockRestore();
	});

	test('redirected: one address gets it, the recipient is named, and no cc goes', async () => {
		vi.stubEnv('CONTEXT', 'branch-deploy');
		vi.stubEnv('EMAIL_REDIRECT_TO', 'maintainer@example.test');

		await expect(
			sendEmail({ ...input, cc: 'someone-else@example.test' }),
		).resolves.toEqual({
			ok: true,
			message: 'Sent.',
			warning:
				'Redirected to maintainer@example.test (branch-deploy) instead of ada@example.test.',
		});
		expect(sendMail).toHaveBeenCalledWith({
			from: 'Virtual Coffee <hello@virtualcoffee.io>',
			to: 'maintainer@example.test',
			cc: undefined,
			subject: '[to: ada@example.test] Hello',
			text: input.text,
			replyTo: 'hello@virtualcoffee.io',
			headers: { 'X-Original-To': 'ada@example.test' },
		});
	});

	test('redirected still needs the credentials', async () => {
		vi.stubEnv('CONTEXT', 'dev');
		vi.stubEnv('EMAIL_REDIRECT_TO', 'maintainer@example.test');
		vi.stubEnv('GOOGLE_SMTP_APP_PASSWORD', undefined);

		await expect(sendEmail(input)).resolves.toMatchObject({
			ok: false,
			definitelyNotSent: true,
		});
		expect(sendMail).not.toHaveBeenCalled();
	});

	test('a redirect target the server rejects is a failure, judged on that address', async () => {
		vi.stubEnv('CONTEXT', 'dev');
		vi.stubEnv('EMAIL_REDIRECT_TO', 'maintainer@example.test');
		sendMail.mockResolvedValue({
			accepted: [],
			rejected: ['maintainer@example.test'],
		});

		await expect(sendEmail(input)).resolves.toMatchObject({
			ok: false,
			definitelyNotSent: true,
		});
	});

	test('production ignores EMAIL_REDIRECT_TO', async () => {
		vi.stubEnv('EMAIL_REDIRECT_TO', 'maintainer@example.test');
		await expect(sendEmail(input)).resolves.toEqual({
			ok: true,
			message: 'Sent.',
		});
		expect(sendMail).toHaveBeenLastCalledWith(
			expect.objectContaining({ to: input.to, subject: input.subject }),
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

		vi.stubEnv('EMAIL_REDIRECT_TO', 'maintainer@example.test');
		expect(emailStatus()).toEqual({
			mode: 'redirected',
			context: 'deploy-preview',
			redirectTo: 'maintainer@example.test',
			configured: false,
		});
	});
});
