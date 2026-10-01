import { describe, expect, test } from 'vitest';

import {
	coffeeInviteEmail,
	slackInviteEmail,
	volunteerAccrualEmail,
	volunteerGrantEmail,
	volunteerInviteEmail,
	welcomeEmail,
	type Template,
} from './templates';

const URL = 'https://virtualcoffee.io/join?invite=abc';

/**
 * A maintainer signs off on this text verbatim in the confirmation dialog, so
 * the checks are about what must be in it, not its exact wording.
 */
const templates: Array<[string, Template, string | null]> = [
	['coffeeInviteEmail', coffeeInviteEmail('Ada Lovelace'), null],
	['welcomeEmail', welcomeEmail('Ada Lovelace'), null],
	[
		'volunteerInviteEmail',
		volunteerInviteEmail('Grace', 'Ada Lovelace', URL),
		URL,
	],
	['volunteerGrantEmail', volunteerGrantEmail('Ada Lovelace', 2, URL), URL],
	['volunteerAccrualEmail', volunteerAccrualEmail('Ada Lovelace', 3, URL), URL],
	['slackInviteEmail', slackInviteEmail('Ada Lovelace', URL), URL],
];

describe.each(templates)('%s', (_name, template) => {
	test('has a subject, greets by first name, and signs off', () => {
		expect(template.subject.length).toBeGreaterThan(0);
		expect(template.text).toMatch(/^Hi Ada,\n/);
		expect(template.text.trimEnd()).toMatch(/\nVirtual Coffee$/);
	});
});

describe.each(templates.filter(([, , link]) => link !== null))(
	'%s',
	(_name, template, link) => {
		test('carries the link it was given verbatim, on its own line', () => {
			expect(template.text).toContain(`\n  ${link}\n`);
		});
	},
);

describe('names', () => {
	test('a blank name becomes "there" rather than "Hi ,"', () => {
		expect(welcomeEmail('   ').text).toMatch(/^Hi there,/);
	});

	test('the inviter is named in the subject and body', () => {
		const template = volunteerInviteEmail('Grace Hopper', 'Ada', URL);
		expect(template.subject).toBe('Grace Hopper invited you to Virtual Coffee');
		expect(template.text).toContain('Grace Hopper gets the invite back');
	});
});

describe('plurals', () => {
	test('one invite, two invites', () => {
		expect(volunteerGrantEmail('Ada', 1, URL).text).toContain(
			'You have 1 invite to give out',
		);
		expect(volunteerGrantEmail('Ada', 2, URL).text).toContain(
			'You have 2 invites to give out',
		);
		expect(volunteerAccrualEmail('Ada', 1, URL).subject).toBe(
			'You have 1 Virtual Coffee invite',
		);
		expect(volunteerAccrualEmail('Ada', 4, URL).subject).toBe(
			'You have 4 Virtual Coffee invites',
		);
	});
});
