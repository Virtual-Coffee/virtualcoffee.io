import { afterEach, describe, expect, test, vi } from 'vitest';

import { capture, emailDelivery, notifyDelivery } from './outbound';

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
