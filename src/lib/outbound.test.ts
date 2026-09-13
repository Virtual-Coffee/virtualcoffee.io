import { afterEach, describe, expect, test, vi } from 'vitest';

import { capture, emailDelivery, notifyDelivery } from './outbound';

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
