/**
 * `_EXAMPLE.ts` asks for "standard unicode emojis - maintainers will reject PRs
 * otherwise", and `MemberCards.tsx` interpolates the value straight into an
 * `<h3>`. `MemberObject.emoji` is typed `string`, so nothing but review catches
 * this today.
 *
 * The first alternative covers RGI emoji — the sequences vendors actually draw,
 * including ZWJ sequences and skin-tone modifiers. The second admits a lone
 * pictographic codepoint that isn't RGI on its own, optionally followed by a
 * variation selector: U+262F (yin yang) is in the members list today and would
 * otherwise be rejected.
 */
const EMOJI = /^(?:\p{RGI_Emoji}|\p{Extended_Pictographic}\uFE0F?)$/v;

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require `emoji` in a member file to be a standard Unicode emoji.',
		},
		schema: [],
		messages: {
			notAnEmoji:
				'`emoji` must be a single standard Unicode emoji. `{{value}}` is not one, and maintainers reject PRs that use anything else.',
			notALiteral:
				'`emoji` must be a plain string holding a single standard Unicode emoji.',
		},
	},

	create(context) {
		return {
			'Property[key.name="emoji"]'(node) {
				if (node.computed) return;

				if (
					node.value.type !== 'Literal' ||
					typeof node.value.value !== 'string'
				) {
					context.report({ node: node.value, messageId: 'notALiteral' });
					return;
				}

				const value = node.value.value;
				if (!EMOJI.test(value)) {
					context.report({
						node: node.value,
						messageId: 'notAnEmoji',
						data: { value },
					});
				}
			},
		};
	},
};

export default rule;
