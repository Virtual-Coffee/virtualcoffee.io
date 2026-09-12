import { describe, expect, test } from 'vitest';
import { parseMarkdown } from './markdown.server';

describe('parseMarkdown', () => {
	test('renders markdown to HTML', async () => {
		expect(
			await parseMarkdown(
				'# Hello\n\nSome *emphasis* and a [link](https://example.com).',
			),
		).toBe(
			'<h1>Hello</h1>\n<p>Some <em>emphasis</em> and a <a href="https://example.com">link</a>.</p>',
		);
	});

	test('runs the result through the shared HTML allowlist', async () => {
		// remark-rehype drops raw HTML by default; the point is that whatever
		// reaches the output has been through `sanitizeHtml`, the same allowlist
		// as CMS content — so a link with a javascript: URL loses its href.
		expect(await parseMarkdown('[x](javascript:alert(1))')).toBe(
			'<p><a>x</a></p>',
		);
	});
});
