import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { sanitizeHtml } from '@/util/sanitizeCmsData';

/**
 * Render a markdown string to sanitized HTML.
 *
 * Sanitization is deliberately handled by `sanitizeHtml` rather than
 * `rehype-sanitize` so that every HTML path in the app — markdown we render
 * here, pre-rendered HTML from GitHub, and `renderHtml` fields from the CMS —
 * is governed by the single allowlist in `sanitizeCmsData.ts`.
 */
export async function parseMarkdown(markdown: string) {
	const file = await unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeStringify)
		.process(markdown);

	return sanitizeHtml(String(file));
}
