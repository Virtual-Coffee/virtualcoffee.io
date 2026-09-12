import { describe, expect, test } from 'vitest';

import type { SlackMember } from '../../src/data/slackMembers';
import { CONFIDENT_SCORE, normalise, score } from './match';

const member: SlackMember = {
	id: 'U0AB12CD3',
	name: 'Grace Hopper',
	displayName: 'Grace',
	handle: 'gracehopper',
	image: null,
};

const nobody = {
	name: '',
	profileName: null,
	githubUsername: null,
	email: null,
};

describe('normalise', () => {
	test('folds case, whitespace and punctuation — one username really ends in a space', () => {
		expect(normalise(' Grace_Hopper ')).toBe('gracehopper');
		expect(normalise('grace.hopper')).toBe('gracehopper');
		expect(normalise(null)).toBe('');
	});
});

describe('score', () => {
	test('nothing in common is no candidate at all', () => {
		expect(score(member, { ...nobody, name: 'Ada' })).toBeNull();
	});

	test('a GitHub handle alone is confident; a name alone is not', () => {
		const github = score(member, { ...nobody, githubUsername: 'Grace-Hopper' });
		expect(github).toMatchObject({
			slackUserId: 'U0AB12CD3',
			score: 50,
			why: ['github matches slack handle'],
		});
		expect(github!.score).toBeGreaterThanOrEqual(CONFIDENT_SCORE);

		const name = score(member, { ...nobody, name: 'Grace' });
		expect(name).toMatchObject({ score: 20, why: ['name matches'] });
		expect(name!.score).toBeLessThan(CONFIDENT_SCORE);
	});

	test('the weights add up: 50 + 30 + 40 + 20', () => {
		expect(
			score(member, {
				name: 'Grace',
				profileName: 'Grace Hopper',
				githubUsername: 'gracehopper',
				email: 'grace.hopper@example.test',
			}),
		).toMatchObject({
			score: 140,
			why: [
				'github matches slack handle',
				'email local-part matches slack handle',
				'full name matches',
				'name matches',
			],
		});
	});

	test('a short name is only a prefix hint, and two letters are ignored', () => {
		expect(score(member, { ...nobody, name: 'Grac' })).toMatchObject({
			score: 8,
			why: ['name is a prefix'],
		});
		expect(score(member, { ...nobody, name: 'Gr' })).toBeNull();
	});
});
