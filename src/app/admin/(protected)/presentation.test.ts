import { describe, expect, test } from 'vitest';

import { githubRefLabel } from './presentation';

describe('githubRefLabel', () => {
	test('an issue URL is owner/repo#number', () => {
		expect(
			githubRefLabel(
				'https://github.com/Virtual-Coffee/lunch-and-learn/issues/42',
			),
		).toBe('Virtual-Coffee/lunch-and-learn#42');
	});

	test('a pull request URL is owner/repo#number', () => {
		expect(
			githubRefLabel(
				'https://github.com/Virtual-Coffee/virtualcoffee.io/pull/7',
			),
		).toBe('Virtual-Coffee/virtualcoffee.io#7');
	});

	test('any other URL is returned unchanged', () => {
		const url = 'https://example.com/Virtual-Coffee/repo/issues/42';
		expect(githubRefLabel(url)).toBe(url);
	});

	test('a string that is not a URL is returned unchanged', () => {
		expect(githubRefLabel('not a url')).toBe('not a url');
	});
});
