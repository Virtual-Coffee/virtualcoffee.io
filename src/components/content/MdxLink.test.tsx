import Link from 'next/link';
import { describe, expect, test } from 'vitest';
import MdxLink from './MdxLink';

describe('MdxLink', () => {
	test.each([
		'/members',
		'/monthlychallenges/may-2025',
		'/resources?tag=x#top',
	])('routes the page %s through next/link', (href) => {
		expect(MdxLink({ href, children: 'x' }).type).toBe(Link);
	});

	test.each([
		'/assets/pdfs/lightning-talk-guide.pdf',
		'#theme',
		'//cdn.example.com/x',
		'https://dev.to',
		'mailto:hello@example.com',
		undefined,
	])('leaves %s as a plain anchor', (href) => {
		expect(MdxLink({ href, children: 'x' }).type).toBe('a');
	});
});
