/**
 * Shared helpers for the member-file rules.
 *
 * `github` is the authoritative value in a member file: `getMembers()` looks the
 * member up by it and drops anyone GitHub doesn't recognise. The filename and
 * the exported identifier are both derived from it.
 */

/** The placeholder `_EXAMPLE.ts` ships with. */
export const PLACEHOLDER_GITHUB = 'yourGitHubUserName';

/** The identifier `_EXAMPLE.ts` ships with. */
export const TEMPLATE_EXPORT_NAME = '_EXAMPLE';

/**
 * GitHub's own username rule: alphanumerics and single interior hyphens, 39
 * characters at most.
 */
export const GITHUB_USERNAME = /^[A-Za-z\d](?:[A-Za-z\d]|-(?=[A-Za-z\d])){0,38}$/;

/**
 * Turn a GitHub username into the identifier the member file must export.
 *
 * Hyphens are legal in a username but not in an identifier, and a username may
 * start with a digit, which an identifier may not.
 *
 * @param {string} github
 * @returns {string}
 */
export function exportNameFor(github) {
	const name = github.replace(/[^A-Za-z0-9_$]/g, '_');
	return /^[0-9]/.test(name) ? `_${name}` : name;
}

/**
 * The `github` property of the exported `MemberObject`, or null if the file
 * doesn't have one.
 *
 * @param {import('estree').ObjectExpression} objectExpression
 */
export function findGithubProperty(objectExpression) {
	return (
		objectExpression.properties.find(
			(property) =>
				property.type === 'Property' &&
				!property.computed &&
				(property.key.type === 'Identifier'
					? property.key.name
					: property.key.value) === 'github',
		) ?? null
	);
}
