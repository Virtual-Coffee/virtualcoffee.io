/**
 * `src/util/markdown.server.ts` explains the invariant this enforces: every HTML
 * path in the app is governed by the single allowlist in `sanitizeCmsData.ts`,
 * which is why `rehype-sanitize` is deliberately not used. `DisplayHtml` is the
 * one component allowed to inject HTML, so routing everything through it keeps
 * the set of places to audit down to one.
 *
 * The exemption for `DisplayHtml` itself lives in `eslint.config.mjs`.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow `dangerouslySetInnerHTML` outside the `DisplayHtml` component.',
		},
		schema: [],
		messages: {
			raw: 'Render this through `DisplayHtml` from `@/components/DisplayHtml` instead, and make sure the HTML has been through `sanitizeHtml` first.',
		},
	},

	create(context) {
		return {
			'JSXAttribute[name.name="dangerouslySetInnerHTML"]'(node) {
				context.report({ node, messageId: 'raw' });
			},
		};
	},
};

export default rule;
