/**
 * A `page.tsx` with neither export inherits the root layout's title and OG card
 * from `src/app/layout.tsx`, which is silent and almost never what a new page
 * wants. Both shapes in the codebase are accepted: `export const metadata`, used
 * by the monthly challenge pages, and `export async function generateMetadata`,
 * used by everything that calls `createMetaData`.
 *
 * `src/app/page.tsx` is exempted in `eslint.config.mjs` — the home page really
 * should inherit the site-wide metadata.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require a page to export `metadata` or `generateMetadata`.',
		},
		schema: [],
		messages: {
			missing:
				'This page exports neither `metadata` nor `generateMetadata`, so it silently inherits the site-wide title and social card. Add `export async function generateMetadata()` returning `createMetaData({ … })`.',
		},
	},

	create(context) {
		return {
			'Program:exit'(program) {
				const hasMetadata = program.body.some((statement) => {
					if (statement.type !== 'ExportNamedDeclaration') return false;

					const declaration = statement.declaration;
					if (!declaration) {
						// `export { metadata }` / `export { x as generateMetadata }`
						return statement.specifiers.some((specifier) =>
							['metadata', 'generateMetadata'].includes(
								specifier.exported.name,
							),
						);
					}

					if (declaration.type === 'FunctionDeclaration') {
						return declaration.id?.name === 'generateMetadata';
					}

					if (declaration.type === 'VariableDeclaration') {
						return declaration.declarations.some(
							(declarator) =>
								declarator.id.type === 'Identifier' &&
								['metadata', 'generateMetadata'].includes(declarator.id.name),
						);
					}

					return false;
				});

				if (!hasMetadata) {
					context.report({ node: program, messageId: 'missing' });
				}
			},
		};
	},
};

export default rule;
