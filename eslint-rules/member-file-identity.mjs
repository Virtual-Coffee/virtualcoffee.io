import path from 'node:path';

import {
	GITHUB_USERNAME,
	PLACEHOLDER_GITHUB,
	TEMPLATE_EXPORT_NAME,
	exportNameFor,
	findGithubProperty,
} from './memberIdentity.mjs';

/**
 * A member file's filename, exported identifier and `github` field must all name
 * the same person.
 *
 * They drift for two different reasons, and both fail silently:
 *
 * - `getMembers()` resolves a member by `github`, and returns null for anyone
 *   GitHub doesn't recognise, so a typo drops that member off the site with a
 *   green build.
 * - `scripts/loadMemberFiles.ts` emits `export * from …`, so the exported
 *   identifier is the key of the namespace object `src/data/members/index.ts`
 *   iterates. Two files exporting the same name make it ambiguous, and the
 *   error surfaces in a generated, gitignored file.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require a member file to export one `MemberObject` whose name and filename both match its `github` field.',
		},
		fixable: 'code',
		schema: [],
		messages: {
			missingExport:
				'A member file must export exactly one `MemberObject`, e.g. `export const yourGitHubUserName: MemberObject = { … };`.',
			multipleExports:
				'A member file must export exactly one `MemberObject`. `scripts/loadMemberFiles.ts` re-exports this file with `export *`, so every extra export lands in the members list too.',
			missingAnnotation:
				'Annotate this with `: MemberObject` so TypeScript checks your accounts, badges and location.',
			missingGithub:
				'A member file needs a `github` property holding your GitHub username as a string.',
			placeholderGithub:
				'Replace the `{{placeholder}}` placeholder with your GitHub username, or you will not appear on the members page.',
			invalidGithub:
				'`{{github}}` is not a valid GitHub username, so this member will be silently left off the members page.',
			filenameMismatch:
				'Rename this file to `{{github}}.ts` to match the `github` field.',
			exportNameMismatch:
				'Rename this export to `{{expected}}` to match the `github` field.',
			templateExportName:
				'This file still exports the `{{template}}` name from the template. Rename it to `{{expected}}` — if another member does the same, both of you silently disappear from the members page.',
		},
	},

	create(context) {
		/** @type {{ declarator: any, declaration: any }[]} */
		const memberDeclarations = [];

		return {
			'Program > ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'(
				node,
			) {
				if (
					node.id.type === 'Identifier' &&
					node.init?.type === 'ObjectExpression'
				) {
					memberDeclarations.push(node);
				}
			},

			'Program:exit'(program) {
				if (memberDeclarations.length === 0) {
					context.report({ node: program, messageId: 'missingExport' });
					return;
				}

				for (const extra of memberDeclarations.slice(1)) {
					context.report({ node: extra.id, messageId: 'multipleExports' });
				}

				const declarator = memberDeclarations[0];

				const annotation = declarator.id.typeAnnotation?.typeAnnotation;
				if (
					annotation?.type !== 'TSTypeReference' ||
					annotation.typeName.type !== 'Identifier' ||
					annotation.typeName.name !== 'MemberObject'
				) {
					context.report({
						node: declarator.id,
						messageId: 'missingAnnotation',
					});
				}

				const githubProperty = findGithubProperty(declarator.init);

				if (
					!githubProperty ||
					githubProperty.value.type !== 'Literal' ||
					typeof githubProperty.value.value !== 'string'
				) {
					context.report({
						node: githubProperty ?? declarator.init,
						messageId: 'missingGithub',
					});
					return;
				}

				const github = githubProperty.value.value;

				if (github === PLACEHOLDER_GITHUB) {
					context.report({
						node: githubProperty.value,
						messageId: 'placeholderGithub',
						data: { placeholder: PLACEHOLDER_GITHUB },
					});
					return;
				}

				if (!GITHUB_USERNAME.test(github)) {
					context.report({
						node: githubProperty.value,
						messageId: 'invalidGithub',
						data: { github },
					});
					return;
				}

				// GitHub usernames are case-insensitive, and `getMembers()` lowercases
				// before looking one up, so the filename only has to agree in spelling.
				const basename = path.basename(context.filename, '.ts');
				if (basename.toLowerCase() !== github.toLowerCase()) {
					context.report({
						node: githubProperty.value,
						messageId: 'filenameMismatch',
						data: { github },
					});
				}

				// The identifier, unlike the filename, has to be exact.
				const expected = exportNameFor(github);
				const actual = declarator.id.name;
				if (actual !== expected) {
					context.report({
						node: declarator.id,
						messageId:
							actual === TEMPLATE_EXPORT_NAME
								? 'templateExportName'
								: 'exportNameMismatch',
						data: { expected, template: TEMPLATE_EXPORT_NAME },
						fix: (fixer) =>
							fixer.replaceTextRange(
								// Replace only the name: `declarator.id` spans the type
								// annotation too, and that has to survive.
								[
									declarator.id.range[0],
									declarator.id.range[0] + actual.length,
								],
								expected,
							),
					});
				}
			},
		};
	},
};

export default rule;
