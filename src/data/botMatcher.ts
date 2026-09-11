/**
 * Matches a User-Agent header against a list of crawler product tokens.
 *
 * Keep this module free of imports — `netlify/edge-functions/block-bots.ts`
 * bundles it for Deno, which has no Node built-ins.
 *
 * The list is written for robots.txt, where matching is on whole product
 * tokens. A plain `includes` is not that: upstream carries tokens like `Code`
 * (GitHub Copilot) and `Spider`, and `ua.includes('code')` matches any agent
 * with "code" in its name — `vscode/1.2` among them. So the tokens are fenced
 * by a delimiter class instead.
 *
 * The delimiter class excludes `-` deliberately, because hyphens are part of
 * the token: it is what stops `Applebot` matching inside `Applebot-Extended`,
 * and `Claude` inside `Claude-User`.
 */

const escapeRegExp = (value: string) =>
	value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Builds one case-insensitive pattern for the whole list. Returns a matcher
 * that gives back the list entry that fired — spelled as it is in the list,
 * not as it appeared in the header — or `null` for no match. For an empty
 * list it is always `null`, rather than a pattern that matches everything.
 */
export function createBotMatcher(tokens: string[]) {
	if (tokens.length === 0) return () => null;

	const pattern = new RegExp(
		`(?:^|[^a-z0-9-])(${tokens.map(escapeRegExp).join('|')})(?:$|[^a-z0-9-])`,
		'i',
	);
	const byLowerCase = new Map(tokens.map((t) => [t.toLowerCase(), t]));

	return (userAgent: string): string | null => {
		const hit = pattern.exec(userAgent)?.[1];
		return hit === undefined
			? null
			: (byLowerCase.get(hit.toLowerCase()) ?? null);
	};
}
