import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { capture, deliver, emailDelivery, notifyDelivery } from './outbound';

afterEach(() => vi.unstubAllEnvs());

describe('emailDelivery', () => {
	test.each(['deploy-preview', 'branch-deploy', 'dev', undefined])(
		'CONTEXT=%s is captured',
		(context) => {
			vi.stubEnv('CONTEXT', context);
			vi.stubEnv('EMAIL_REDIRECT_TO', undefined);
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

	test('EMAIL_REDIRECT_TO redirects outside production', () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('EMAIL_REDIRECT_TO', ' maintainer@example.test ');
		expect(emailDelivery()).toEqual({
			mode: 'redirected',
			context: 'deploy-preview',
			redirectTo: 'maintainer@example.test',
		});
	});

	test('EMAIL_REDIRECT_TO is ignored in production', () => {
		vi.stubEnv('CONTEXT', 'production');
		vi.stubEnv('EMAIL_REDIRECT_TO', 'maintainer@example.test');
		expect(emailDelivery()).toEqual({ mode: 'live' });
	});

	test('a blank EMAIL_REDIRECT_TO is no redirect', () => {
		vi.stubEnv('CONTEXT', 'dev');
		vi.stubEnv('EMAIL_REDIRECT_TO', '  ');
		expect(emailDelivery()).toMatchObject({ mode: 'captured' });
	});

	test('a multi-address EMAIL_REDIRECT_TO is captured, not redirected', () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv(
			'EMAIL_REDIRECT_TO',
			'maintainer@example.test, other@example.test',
		);
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		expect(emailDelivery()).toEqual({
			mode: 'captured',
			context: 'deploy-preview',
		});
		expect(warn).toHaveBeenCalledOnce();
		warn.mockRestore();
	});
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
	test('names the kind, deploy and target, then the whole body', () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});

		capture('slack', 'membership', 'hi');
		expect(info).toHaveBeenLastCalledWith(
			'[slack captured] deploy-preview membership',
			'\nhi',
		);

		capture('email', 'a@example.test', 'body', { subject: 'Hello' });
		expect(info).toHaveBeenLastCalledWith(
			'[email captured] deploy-preview a@example.test',
			{ subject: 'Hello' },
			'\nbody',
		);
		info.mockRestore();
	});
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
		expect(info).toHaveBeenCalledWith(
			'[slack captured] deploy-preview membership',
			{ subject: 'Hello' },
			'\nhi',
		);
		info.mockRestore();
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
		vi.stubEnv('EMAIL_REDIRECT_TO', 'maintainer@example.test');
		await deliver({
			kind: 'email',
			target: 'a@example.test',
			body: 'hi',
			unreachable: 'the mail server',
			live,
		});
		expect(live).toHaveBeenLastCalledWith({
			mode: 'redirected',
			context: 'dev',
			redirectTo: 'maintainer@example.test',
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
