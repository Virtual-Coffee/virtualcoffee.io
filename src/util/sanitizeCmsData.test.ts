import { describe, expect, test } from 'vitest';
import { sanitizeCmsData, sanitizeHtml } from './sanitizeCmsData';

/**
 * This is the one allowlist for every HTML path in the app — CMS `renderHtml`
 * fields, markdown rendered by `markdown.server.ts`, and pre-rendered HTML
 * from GitHub. A loosening here reaches all of them.
 */
describe('sanitizeHtml', () => {
	test('drops scripts and inline event handlers', async () => {
		expect(
			await sanitizeHtml(
				'<p onclick="steal()">Hi</p><script>alert(1)</script>',
			),
		).toBe('<p>Hi</p>');
	});

	test('keeps the tags prose is written in', async () => {
		const html =
			'<h2>Heading</h2><p>Some <strong>bold</strong> and <em>italic</em> text.</p><ul><li>one</li></ul><pre><code>x</code></pre>';
		expect(await sanitizeHtml(html)).toBe(html);
	});

	test('keeps only href, name and target on links', async () => {
		expect(
			await sanitizeHtml(
				'<a href="https://example.com" target="_blank" rel="noopener" class="x">link</a>',
			),
		).toBe('<a href="https://example.com" target="_blank">link</a>');
	});

	test('drops javascript: hrefs but keeps mailto: and protocol-relative ones', async () => {
		expect(await sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe(
			'<a>x</a>',
		);
		expect(await sanitizeHtml('<a href="mailto:hi@example.com">x</a>')).toBe(
			'<a href="mailto:hi@example.com">x</a>',
		);
		expect(await sanitizeHtml('<a href="//example.com/p">x</a>')).toBe(
			'<a href="//example.com/p">x</a>',
		);
	});

	test('drops iframes and form controls', async () => {
		expect(
			await sanitizeHtml(
				'<p>a</p><iframe src="https://example.com"></iframe><input value="b"><button>c</button>',
			),
		).toBe('<p>a</p>c');
	});
});

describe('sanitizeCmsData', () => {
	test('sanitizes only the renderHtml key, wherever it sits', () => {
		const input = {
			title: '<script>not html, left alone</script>',
			renderHtml: '<p>ok</p><script>x</script>',
			nested: {
				renderHtml: '<img src="x" onerror="y">',
				list: [{ renderHtml: '<b onmouseover="z">bold</b>' }, { other: 1 }],
			},
		};

		expect(sanitizeCmsData(input)).toEqual({
			title: '<script>not html, left alone</script>',
			renderHtml: '<p>ok</p>',
			nested: {
				renderHtml: '<img src="x" />',
				list: [{ renderHtml: '<b>bold</b>' }, { other: 1 }],
			},
		});
	});

	test('passes arrays and primitives through', () => {
		expect(sanitizeCmsData([{ renderHtml: '<u>a</u>' }, { n: 2 }])).toEqual([
			{ renderHtml: '<u>a</u>' },
			{ n: 2 },
		]);
		expect(sanitizeCmsData('plain')).toBe('plain');
		expect(sanitizeCmsData(null)).toBeNull();
		expect(sanitizeCmsData(42)).toBe(42);
	});
});
