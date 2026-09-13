import { expect, test } from 'vitest';

import { looksLikeHtml } from './descriptionFormat';

test.each([
	['<p>Hello</p>', true],
	['Line one<br>line two', true],
	['Plain **Markdown** with a < b', false],
	['', false],
])('looksLikeHtml(%j) is %s', (raw, expected) => {
	expect(looksLikeHtml(raw)).toBe(expected);
});
