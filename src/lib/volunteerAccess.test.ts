import { afterEach, describe, expect, test, vi } from 'vitest';

import { redirectTo } from '@/test/next';
import type { Session } from './auth';
import {
	isVolunteer,
	requireVolunteer,
	sessionSlackUserId,
} from './volunteerAccess';

function sessionWith(user: Record<string, unknown>): Session {
	return { user } as unknown as Session;
}

describe('isVolunteer', () => {
	test('asks about the role by name, wherever it sits in the string', () => {
		expect(isVolunteer(sessionWith({ role: 'volunteer' }))).toBe(true);
		expect(isVolunteer(sessionWith({ role: 'admin,volunteer' }))).toBe(true);
		expect(isVolunteer(sessionWith({ role: 'admin' }))).toBe(false);
		expect(isVolunteer(sessionWith({ role: null }))).toBe(false);
		expect(isVolunteer(null)).toBe(false);
	});
});

describe('sessionSlackUserId', () => {
	test('reads the id off the session without a lookup', () => {
		expect(sessionSlackUserId(sessionWith({ slackUserId: 'U1' }))).toBe('U1');
		expect(sessionSlackUserId(sessionWith({}))).toBeNull();
		expect(sessionSlackUserId(null)).toBeNull();
	});
});

describe('requireVolunteer', () => {
	afterEach(() => vi.unstubAllEnvs());

	function bypass(values: Record<string, string | undefined>) {
		vi.stubEnv('ADMIN_DEV_BYPASS', 'true');
		vi.stubEnv('CONTEXT', undefined);
		vi.stubEnv('PREVIEW_ADMIN_BYPASS', undefined);
		for (const [key, value] of Object.entries(values)) vi.stubEnv(key, value);
	}

	test('lets a volunteer in with their Slack id', async () => {
		bypass({
			ADMIN_DEV_BYPASS_ROLES: 'volunteer',
			ADMIN_DEV_BYPASS_SLACK_ID: 'U0AB12CD3',
		});
		await expect(requireVolunteer()).resolves.toMatchObject({
			slackUserId: 'U0AB12CD3',
		});
	});

	test('redirects rather than 404s — an admin is not a volunteer', async () => {
		bypass({ ADMIN_DEV_BYPASS_ROLES: 'admin' });
		await expect(requireVolunteer()).rejects.toMatchObject(
			redirectTo('/invites/sign-in'),
		);
	});

	test('a bypass session always carries a Slack id, so the seed matches it', async () => {
		bypass({
			ADMIN_DEV_BYPASS_ROLES: 'volunteer',
			ADMIN_DEV_BYPASS_SLACK_ID: ' ',
		});
		await expect(requireVolunteer()).resolves.toMatchObject({
			slackUserId: 'U_DEV_BYPASS',
		});
	});

	/**
	 * The ADR 0010 point: /invites never consults `adminRoutesEnabled()`, so a
	 * deploy preview reviews it without PREVIEW_ADMIN_BYPASS. The dev bypass is
	 * off in that context, so this goes through the preview bypass session.
	 */
	test('works on a deploy preview where /admin would 404', async () => {
		vi.stubEnv('ADMIN_DEV_BYPASS', undefined);
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('PREVIEW_ADMIN_BYPASS', 'true');
		vi.stubEnv('PREVIEW_ADMIN_BYPASS_ROLES', 'volunteer');
		await expect(requireVolunteer()).resolves.toMatchObject({
			slackUserId: 'U_PREVIEW_BYPASS',
		});
	});
});
