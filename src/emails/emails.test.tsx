import { describe, expect, test } from 'vitest';
import { render } from 'react-email';
import { z } from 'zod';

import { renderEmail, type EmailTemplate } from '@/lib/email/render';
import { coffeeInvite } from './coffeeInvite';
import { slackInvite } from './slackInvite';
import { volunteerAccrual } from './volunteerAccrual';
import { volunteerGrant } from './volunteerGrant';
import { volunteerInvite } from './volunteerInvite';
import { welcome } from './welcome';

const URL = 'https://virtualcoffee.io/join?invite=abc';

type Case<P extends object> = [string, EmailTemplate<P>, P, string | null];

/**
 * A maintainer signs off on the Content in the confirmation dialog, so the
 * checks are about what must be in the rendered message, not its wording.
 * The plain-text part is derived from the same tree as the HTML.
 */
const templates = [
	['coffeeInvite', coffeeInvite, { name: 'Ada Lovelace' }, null],
	['welcome', welcome, { name: 'Ada Lovelace' }, null],
	[
		'volunteerInvite',
		volunteerInvite,
		{ inviterName: 'Grace', inviteeName: 'Ada Lovelace', claimUrl: URL },
		URL,
	],
	[
		'volunteerGrant',
		volunteerGrant,
		{ name: 'Ada Lovelace', balance: 2, invitesUrl: URL },
		URL,
	],
	[
		'volunteerAccrual',
		volunteerAccrual,
		{ name: 'Ada Lovelace', balance: 3, invitesUrl: URL },
		URL,
	],
	['slackInvite', slackInvite, { name: 'Ada Lovelace', inviteUrl: URL }, URL],
] as unknown as Case<never>[];

describe.each(templates)('%s', (_name, template, props, link) => {
	test('has a subject, greets by first name, signs off, and is a full document', async () => {
		await expect(renderEmail(template, props)).resolves.toEqual(
			expect.schemaMatching(
				z.object({
					subject: z.string().min(1),
					text: z
						.string()
						.startsWith('Hi Ada,\n')
						.includes('\nVirtual Coffee\n'),
					html: z
						.string()
						.startsWith('<!DOCTYPE html')
						.includes('alt="Virtual Coffee"'),
				}),
			),
		);
	});

	if (link) {
		test('carries the link it was given as an href and in the text', async () => {
			await expect(renderEmail(template, props)).resolves.toEqual(
				expect.schemaMatching(
					z.object({
						html: z.string().includes(`href="${link}"`),
						text: z.string().includes(link),
					}),
				),
			);
		});
	}
});

describe('Content', () => {
	test('is the body without the shell, so a dialog can render it inline', async () => {
		const element = <welcome.Content name="Ada Lovelace" />;
		await expect(render(element)).resolves.toEqual(
			expect.schemaMatching(
				z
					.string()
					.refine((html) => !html.includes('<html'))
					.refine((html) => !html.includes('alt="Virtual Coffee"')),
			),
		);
		await expect(render(element, { plainText: true })).resolves.toEqual(
			expect.schemaMatching(z.string().startsWith('Hi Ada,')),
		);
	});
});

describe('names', () => {
	test('a blank name becomes "there" rather than "Hi ,"', async () => {
		const { text } = await renderEmail(welcome, { name: '   ' });
		expect(text).toEqual(
			expect.schemaMatching(z.string().startsWith('Hi there,')),
		);
	});

	test('the inviter is named in the subject and body', async () => {
		const { subject, text } = await renderEmail(volunteerInvite, {
			inviterName: 'Grace Hopper',
			inviteeName: 'Ada',
			claimUrl: URL,
		});
		expect(subject).toBe('Grace Hopper invited you to Virtual Coffee');
		expect(text).toContain('Grace Hopper gets the invite back');
	});
});

describe('plurals', () => {
	const grant = (balance: number) =>
		renderEmail(volunteerGrant, { name: 'Ada', balance, invitesUrl: URL });
	const accrual = (balance: number) =>
		renderEmail(volunteerAccrual, { name: 'Ada', balance, invitesUrl: URL });

	test('one invite, two invites', async () => {
		expect((await grant(1)).text).toContain('You have 1 invite to give out');
		expect((await grant(2)).text).toContain('You have 2 invites to give out');
		expect((await accrual(1)).subject).toBe('You have 1 Virtual Coffee invite');
		expect((await accrual(4)).subject).toBe(
			'You have 4 Virtual Coffee invites',
		);
	});
});
