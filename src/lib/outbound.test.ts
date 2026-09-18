import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { capture, deliver, emailDelivery, notifyDelivery } from './outbound';

afterEach(() => vi.unstubAllEnvs());

describe('emailDelivery', () => {
	test.each(['deploy-preview', 'branch-deploy', 'dev', undefined])(
		'CONTEXT=%s is captured',
		(context) => {
			vi.stubEnv('CONTEXT', context);
			expect(emailDelivery()).toEqual({
				mode: 'captured',
				context: context ?? 'local',
			});
		},
	);

	test('production is live', () => {
		vi.stubEnv('CONTEXT', 'production');
		expect(emailDelivery()).toEqual({ mode: 'live' });
	});

	test.each(['dev', undefined])(
		'SMTP_HOST is local on a checkout (CONTEXT=%s)',
		(context) => {
			vi.stubEnv('CONTEXT', context);
			vi.stubEnv('SMTP_HOST', 'localhost');
			expect(emailDelivery()).toEqual({
				mode: 'local',
				context: context ?? 'local',
				host: 'localhost',
			});
		},
	);

	// The ADR's promise that nothing leaves the machine is enforced, not trusted.
	test.each(['smtp.gmail.com', 'mailpit', '192.168.1.20'])(
		'SMTP_HOST=%s is not a sink, so a checkout stays captured',
		(host) => {
			vi.stubEnv('CONTEXT', 'dev');
			vi.stubEnv('SMTP_HOST', host);
			expect(emailDelivery()).toEqual({ mode: 'captured', context: 'dev' });
		},
	);

	test.each(['127.0.0.1', '::1', '[::1]', 'LOCALHOST', ' localhost '])(
		'SMTP_HOST=%j is a loopback sink',
		(host) => {
			vi.stubEnv('CONTEXT', 'dev');
			vi.stubEnv('SMTP_HOST', host);
			expect(emailDelivery()).toEqual({
				mode: 'local',
				context: 'dev',
				host: host.trim(),
			});
		},
	);

	test('SMTP_HOST is ignored in production', () => {
		vi.stubEnv('CONTEXT', 'production');
		vi.stubEnv('SMTP_HOST', 'localhost');
		expect(emailDelivery()).toEqual({ mode: 'live' });
	});

	// A deploy's SMTP_HOST would be a host real applicants' mail can reach.
	test.each(['deploy-preview', 'branch-deploy'])(
		'SMTP_HOST is ignored on a deploy (CONTEXT=%s)',
		(context) => {
			vi.stubEnv('CONTEXT', context);
			vi.stubEnv('SMTP_HOST', 'smtp.example.test');
			expect(emailDelivery()).toEqual({ mode: 'captured', context });
		},
	);
});

describe('notifyDelivery', () => {
	test('production is live regardless of the flag', () => {
		vi.stubEnv('CONTEXT', 'production');
		vi.stubEnv('NOTIFY_LIVE_OUTSIDE_PRODUCTION', undefined);
		expect(notifyDelivery()).toBe('live');
	});

	test('outside production it is captured unless opted in', () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('NOTIFY_LIVE_OUTSIDE_PRODUCTION', undefined);
		expect(notifyDelivery()).toBe('captured');
		vi.stubEnv('NOTIFY_LIVE_OUTSIDE_PRODUCTION', 'true');
		expect(notifyDelivery()).toBe('live');
	});

	test('only the literal "true" opts in', () => {
		vi.stubEnv('CONTEXT', undefined);
		vi.stubEnv('NOTIFY_LIVE_OUTSIDE_PRODUCTION', '1');
		expect(notifyDelivery()).toBe('captured');
	});
});

describe('capture', () => {
	const body = [
		'Hello Ada,',
		'Your invite: https://virtualcoffee.io/join-slack?code=abc123.',
		'Questions? https://virtualcoffee.io/faq and https://virtualcoffee.io/faq again.',
	].join('\n');

	test.each(['dev', undefined])(
		'locally (CONTEXT=%s) the whole body goes to the log',
		(context) => {
			vi.stubEnv('CONTEXT', context);
			const info = vi.spyOn(console, 'info').mockImplementation(() => {});

			capture('slack', 'membership', 'hi');
			expect(info).toHaveBeenLastCalledWith(
				`[slack captured] ${context ?? 'local'} membership`,
				'\nhi',
			);

			capture('email', 'ada@example.test', body, { subject: 'Hello' });
			expect(info).toHaveBeenLastCalledWith(
				`[email captured] ${context ?? 'local'} ada@example.test`,
				{ subject: 'Hello' },
				`\n${body}`,
			);
			info.mockRestore();
		},
	);

	/**
	 * A deploy's message is about a real person and the log outlives the
	 * walkthrough (docs/adr/0007), so it gets the address masked, the details,
	 * and each link once — enough to follow the invite, nothing to read.
	 */
	test.each(['deploy-preview', 'branch-deploy'])(
		'on a deploy (CONTEXT=%s) only the masked target, details and links',
		(context) => {
			vi.stubEnv('CONTEXT', context);
			const info = vi.spyOn(console, 'info').mockImplementation(() => {});

			capture('email', 'ada@example.test', body, { subject: 'Hello' });
			expect(info).toHaveBeenLastCalledWith(
				`[email captured] ${context} a•••@example.test`,
				{ subject: 'Hello' },
				'\nhttps://virtualcoffee.io/join-slack?code=abc123',
				'\nhttps://virtualcoffee.io/faq',
			);

			capture('slack', 'C0123', 'A new report from Ada');
			expect(info).toHaveBeenLastCalledWith(
				`[slack captured] ${context} C0123`,
			);
			info.mockRestore();
		},
	);
});

describe('deliver', () => {
	const live = vi.fn();

	beforeEach(() => {
		live.mockReset();
		live.mockResolvedValue({ ok: true, message: 'Posted.' });
		vi.stubEnv('CONTEXT', 'production');
	});

	test('captured: logs the message, never calls live, and is a success with a warning', async () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});

		await expect(
			deliver({
				kind: 'slack',
				target: 'membership',
				body: 'hi',
				details: { subject: 'Hello' },
				unreachable: 'Slack',
				live,
			}),
		).resolves.toEqual({
			ok: true,
			message: 'Captured, not posted to Slack (deploy-preview).',
			warning: 'Captured, not posted to Slack (deploy-preview).',
		});
		expect(live).not.toHaveBeenCalled();
		// A deploy's line names nobody and carries no body; `capture` pins that.
		expect(info).toHaveBeenCalledWith(
			'[slack captured] deploy-preview membership',
			{ subject: 'Hello' },
		);
		info.mockRestore();
	});

	test('a slack dm is captured outside production even when Slack posts are opted in', async () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('NOTIFY_LIVE_OUTSIDE_PRODUCTION', 'true');
		vi.spyOn(console, 'info').mockImplementation(() => {});

		await expect(
			deliver({
				kind: 'slack',
				target: 'coc',
				body: '',
				unreachable: 'Slack',
				live,
			}),
		).resolves.toEqual({ ok: true, message: 'Posted.' });

		live.mockClear();
		await expect(
			deliver({
				kind: 'slack dm',
				target: 'U123',
				body: '',
				unreachable: 'Slack',
				live,
			}),
		).resolves.toMatchObject({
			warning: 'Captured, not sent as a Slack DM (deploy-preview).',
		});
		expect(live).not.toHaveBeenCalled();

		vi.stubEnv('CONTEXT', 'production');
		await deliver({
			kind: 'slack dm',
			target: 'U123',
			body: '',
			unreachable: 'Slack',
			live,
		});
		expect(live).toHaveBeenCalledWith({ mode: 'live' });
	});

	test('a captured success carries the extra fields the sender declared', async () => {
		vi.stubEnv('CONTEXT', undefined);
		vi.spyOn(console, 'info').mockImplementation(() => {});

		await expect(
			deliver({
				kind: 'github issue',
				target: 'org/repo',
				body: '',
				unreachable: 'GitHub',
				captured: { url: null },
				live,
			}),
		).resolves.toMatchObject({ ok: true, url: null });
	});

	test('live: hands the resolved mode to the sender and returns its result as-is', async () => {
		await expect(
			deliver({
				kind: 'slack',
				target: 'coc',
				body: 'hi',
				unreachable: 'Slack',
				live,
			}),
		).resolves.toEqual({ ok: true, message: 'Posted.' });
		expect(live).toHaveBeenCalledWith({ mode: 'live' });

		vi.stubEnv('CONTEXT', 'dev');
		vi.stubEnv('SMTP_HOST', 'localhost');
		await deliver({
			kind: 'email',
			target: 'a@example.test',
			body: 'hi',
			unreachable: 'the mail server',
			live,
		});
		expect(live).toHaveBeenLastCalledWith({
			mode: 'local',
			context: 'dev',
			host: 'localhost',
		});
	});

	test('a throw from live is a failure naming what could not be reached', async () => {
		live.mockRejectedValue(new TypeError('fetch failed'));
		await expect(
			deliver({
				kind: 'slack',
				target: 'coc',
				body: 'hi',
				unreachable: 'Slack',
				live,
			}),
		).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'Could not reach Slack: fetch failed',
		});

		live.mockRejectedValue('nope');
		await expect(
			deliver({
				kind: 'slack',
				target: 'coc',
				body: 'hi',
				unreachable: 'Slack',
				live,
			}),
		).resolves.toMatchObject({ message: 'Could not reach Slack.' });
	});

	test('a timeout may have stranded a message the server had begun accepting', async () => {
		live.mockRejectedValue(new DOMException('timed out', 'TimeoutError'));
		await expect(
			deliver({
				kind: 'slack',
				target: 'coc',
				body: 'hi',
				unreachable: 'Slack',
				live,
			}),
		).resolves.toMatchObject({ ok: false, definitelyNotSent: false });

		live.mockRejectedValue(
			Object.assign(new Error('late'), { code: 'ETIMEDOUT' }),
		);
		await expect(
			deliver({
				kind: 'email',
				target: 'a@example.test',
				body: 'hi',
				unreachable: 'the mail server',
				isTimeout: (error) => (error as { code?: string }).code === 'ETIMEDOUT',
				live,
			}),
		).resolves.toEqual({
			ok: false,
			definitelyNotSent: false,
			message: 'Could not reach the mail server: late',
		});
	});
});
