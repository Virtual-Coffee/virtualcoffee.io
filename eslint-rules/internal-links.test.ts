import { ESLint, RuleTester } from 'eslint';
import { describe, expect, it, test } from 'vitest';

import internalLinks from './internal-links.mjs';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

// Espree parses JSX, so the rule is checked without a TypeScript parser.
const ruleTester = new RuleTester({
	languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

const error = [{ messageId: 'absolute' }];

ruleTester.run('vc/internal-links', internalLinks, {
	valid: [
		'<a href="/events">x</a>',
		'<a href="#top">x</a>',
		'<a href="mailto:hello@virtualcoffee.io">x</a>',
		'<a href="https://github.com/Virtual-Coffee/virtualcoffee.io">x</a>',
		'<a href="https://www.newsletter.virtualcoffee.io/">x</a>',
		'<a href="https://virtualcoffee.io.example.com/">x</a>',
		'<a href={url}>x</a>',
		'<a href={`https://virtualcoffee.io/${path}`}>x</a>',
		'<Link href="https://virtualcoffee.io/events">x</Link>',
	],
	invalid: [
		{ code: '<a href="https://virtualcoffee.io">x</a>', errors: error },
		{ code: '<a href="https://virtualcoffee.io/">x</a>', errors: error },
		{ code: '<a href="https://virtualcoffee.io/events">x</a>', errors: error },
		{
			code: '<a href="http://www.virtualcoffee.io/podcast">x</a>',
			errors: error,
		},
		{
			code: '<a href="https://virtualcoffee.io?ref=news">x</a>',
			errors: error,
		},
		{ code: '<a href="https://virtualcoffee.io#about">x</a>', errors: error },
		{
			code: '<a href={"https://virtualcoffee.io/events"}>x</a>',
			errors: error,
		},
		{
			code: '<a href={`https://virtualcoffee.io/events`}>x</a>',
			errors: error,
		},
	],
});

test('e-mail templates are exempt, since a mail client needs absolute URLs', async () => {
	const eslint = new ESLint();
	const page = await eslint.calculateConfigForFile('src/app/page.tsx');
	const email = await eslint.calculateConfigForFile('src/emails/welcome.tsx');

	expect(page.rules['vc/internal-links']).toBeDefined();
	expect(email.rules['vc/internal-links']).toBeUndefined();
});
