import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
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

/**
 * A best-effort Markdown rendering of legacy HTML — what the admin page's
 * editor opens when a description still carries the shape Craft left behind
 * (docs/adr/0014). Whatever Markdown cannot express, `rehype-remark` keeps
 * as text or drops; the maintainer sees the result before saving it.
 */
export async function htmlToMarkdown(html: string) {
	const file = await unified()
		.use(rehypeParse, { fragment: true })
		.use(rehypeRemark)
		.use(remarkStringify, { bullet: '-' })
		.process(html);

	return String(file).trim();
}

/**
 * Whether an Event description still carries HTML tags — the shape Craft left
 * behind, until the calendar is migrated (docs/adr/0014). Markdown is the
 * format; this is the one sniff both the public read and the admin page use.
 */
export function looksLikeHtml(raw: string): boolean {
	// A tag, not a Markdown autolink like `<https://…>` or `<name@…>`.
	return /<\/?[a-z][a-z0-9-]*(?:\s[^<>]*?)?\s*\/?>/i.test(raw);
}
