import { describe, expect, test } from 'vitest';
import {
	htmlToMarkdown,
	looksLikeHtml,
	parseMarkdown,
} from './markdown.server';

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

describe('htmlToMarkdown', () => {
	test('turns the HTML Craft left behind into Markdown', async () => {
		expect(
			await htmlToMarkdown(
				'<p>Come <strong>hang out</strong> on <a href="https://example.com">Zoom</a>.</p><ul><li>Bring coffee</li><li>Or tea</li></ul>',
			),
		).toBe(
			'Come **hang out** on [Zoom](https://example.com).\n\n- Bring coffee\n- Or tea',
		);
	});

	test('keeps the text of what Markdown cannot say', async () => {
		expect(
			await htmlToMarkdown('<div><span class="x">Plain</span> words</div>'),
		).toBe('Plain words');
	});
});

test.each([
	['<p>Hello</p>', true],
	['Line one<br>line two', true],
	['Plain **Markdown** with a < b', false],
	['', false],
])('looksLikeHtml(%j) is %s', (raw, expected) => {
	expect(looksLikeHtml(raw)).toBe(expected);
});
