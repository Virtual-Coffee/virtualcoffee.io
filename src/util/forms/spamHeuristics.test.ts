import { describe, expect, test } from 'vitest';

import { suspectSpam } from './spamHeuristics';

const GOOD_EMAIL = 'jane@example.com';
const GOOD_NAME = 'Jane Doe';

describe('suspectSpam', () => {
	test.each([['HXtBTQgRAfwqQQPyStQoKS'], ['yvsNBVqaraOujSzZ']])(
		'flags the random name %s',
		(name) => {
			expect(suspectSpam({ name, email: GOOD_EMAIL })).toBe('name');
		},
	);

	test.each([
		['Jane Doe'],
		['Ana'],
		['José'],
		['Mary-Jane'],
		['McDonald'],
		['DeShawn'],
		['Bartholomew'],
		['María José García'],
		['Ng'],
	])('does not flag the name %s', (name) => {
		expect(suspectSpam({ name, email: GOOD_EMAIL })).toBeNull();
	});

	test.each([
		['xx.x.xx.xxx.xx.x.x42@gmail.com'],
		// Segment rule: three segments, two of them at most two characters.
		['a.b.c@example.com'],
	])('flags the dotted email %s', (email) => {
		expect(suspectSpam({ name: GOOD_NAME, email })).toBe('email');
	});

	test.each([
		['first.last@example.com'],
		['a.b@example.com'],
		['jane@example.com'],
	])('does not flag the email %s', (email) => {
		expect(suspectSpam({ name: GOOD_NAME, email })).toBeNull();
	});

	// Known false positive: initials only, so every segment is short. The rule
	// is left alone because the caller quarantines a match instead of dropping it.
	test('flags initials-only addresses such as j.r.r@example.com', () => {
		expect(suspectSpam({ name: GOOD_NAME, email: 'j.r.r@example.com' })).toBe(
			'email',
		);
	});

	test('checks the name before the email', () => {
		expect(
			suspectSpam({
				name: 'HXtBTQgRAfwqQQPyStQoKS',
				email: 'xx.x.xx.xxx.xx.x.x42@gmail.com',
			}),
		).toBe('name');
	});
});
