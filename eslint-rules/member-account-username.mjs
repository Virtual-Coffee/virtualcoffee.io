/**
 * `src/data/members/index.ts` builds every account link by concatenation, e.g.
 * `https://medium.com/@${account.username}`. A handle copied out of the address
 * bar, or with the `@` the site displays, produces a dead link that nothing
 * reports — `MemberObject` types `username` as a plain `string`.
 *
 * Dots are deliberately allowed: Medium and Hashnode handles contain them.
 */

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require an account `username` in a member file to be a bare handle, not a URL or an @-prefixed mention.',
		},
		fixable: 'code',
		schema: [],
		messages: {
			leadingAt:
				'Drop the leading `@`: the site adds it where the platform needs one, so `{{value}}` links to a dead page.',
			looksLikeUrl:
				'`username` must be just your handle, not a URL. The site builds the link around it, so `{{value}}` links to a dead page.',
			notALiteral: '`username` must be a plain string holding your handle.',
		},
	},

	create(context) {
		return {
			'Property[key.name="username"]'(node) {
				if (node.computed) return;

				if (
					node.value.type !== 'Literal' ||
					typeof node.value.value !== 'string'
				) {
					context.report({ node: node.value, messageId: 'notALiteral' });
					return;
				}

				const value = node.value.value;

				if (/[/\s]|https?:/i.test(value)) {
					// Not fixable: only the contributor knows which part of the URL is
					// actually their handle.
					context.report({
						node: node.value,
						messageId: 'looksLikeUrl',
						data: { value },
					});
					return;
				}

				if (value.startsWith('@')) {
					context.report({
						node: node.value,
						messageId: 'leadingAt',
						data: { value },
						fix: (fixer) => {
							const quote = context.sourceCode.getText(node.value).at(0);
							return fixer.replaceText(
								node.value,
								`${quote}${value.slice(1)}${quote}`,
							);
						},
					});
				}
			},
		};
	},
};

export default rule;
