const INTERNAL_URL = /^https?:\/\/(www\.)?virtualcoffee\.io(\/|$)/;

/**
 * A page on this site is linked with `Link` and a root-relative path, so
 * typedRoutes checks it and navigation stays client-side. E-mails need absolute
 * URLs; their exemption lives in `eslint.config.mjs`.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow `<a>` elements that link to virtualcoffee.io by absolute URL.',
		},
		schema: [],
		messages: {
			absolute:
				'Link to a page on this site with `Link` from `next/link` and a root-relative path, such as `<Link href="/events">`.',
		},
	},

	create(context) {
		return {
			'JSXOpeningElement[name.name="a"] > JSXAttribute[name.name="href"]'(
				node,
			) {
				let value = node.value;
				if (value?.type === 'JSXExpressionContainer') {
					value = value.expression;
				}

				let text;
				if (value?.type === 'Literal' && typeof value.value === 'string') {
					text = value.value;
				} else if (
					value?.type === 'TemplateLiteral' &&
					value.expressions.length === 0
				) {
					text = value.quasis[0].value.cooked;
				}

				if (text !== undefined && INTERNAL_URL.test(text)) {
					context.report({ node, messageId: 'absolute' });
				}
			},
		};
	},
};

export default rule;
