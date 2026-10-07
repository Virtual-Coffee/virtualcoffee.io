import { describe, expect, test } from 'vitest';

import type { Session } from './auth';
import { isVolunteer, sessionSlackUserId } from './volunteerAccess';

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
