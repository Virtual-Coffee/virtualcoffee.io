import { allowedUas, blockedUas, robotsOnlyUas } from '../src/data/bots';
import { createBotMatcher } from '../src/data/botMatcher';

/**
 * Guards the edge function's matching rules.
 *
 * Matching used to be `ua.includes(token)`, which was safe only because the
 * list was 42 hand-picked names. It is now ~170 tokens from upstream, several
 * of them short enough to be dangerous as substrings — `Code` is GitHub
 * Copilot, and a naive match on it also catches `vscode`.
 *
 * There is no test runner in this repo, so this is a plain script that exits
 * non-zero. Run with `pnpm check-bot-matching`.
 */

const isAllowed = createBotMatcher(allowedUas);
const isBlocked = createBotMatcher(blockedUas);

/** What the edge function would do with this User-Agent. */
function verdict(ua: string) {
	if (isAllowed(ua)) return 'allow';
	return isBlocked(ua) ? 'block' : 'allow';
}

/**
 * Which list entry fires. The edge function logs this, so it has to be the
 * token as written in the list, not however the header happened to spell it.
 */
const tokenCases: [ua: string, expected: string, why: string][] = [
	['Datadog/Synthetics', 'Datadog/Synthetics', 'a token containing a slash'],
	[
		'Mozilla/5.0 (X11; Linux x86_64; rv:155) Gecko/20100101 Firefox/155 DatadogSynthetics',
		'DatadogSynthetics',
		'a token at the end of a browser UA',
	],
	['Code/1.2.3', 'Code', 'a short token'],
	[
		'mozilla/5.0 (compatible; gptbot/1.1; +https://openai.com/gptbot)',
		'GPTBot',
		'reported in list casing, not header casing',
	],
];

const cases: [ua: string, expected: 'allow' | 'block', why: string][] = [
	// Training crawlers are the point of the list.
	[
		'Mozilla/5.0 (compatible; GPTBot/1.1; +https://openai.com/gptbot)',
		'block',
		'GPTBot is a training crawler',
	],
	[
		'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
		'block',
		'ClaudeBot is a training crawler',
	],
	[
		'CCBot/2.0 (https://commoncrawl.org/faq/)',
		'block',
		'CCBot is a training crawler',
	],

	// Agents fetching because a person asked, and search crawlers that cite us.
	[
		'Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)',
		'allow',
		'user-initiated fetch',
	],
	[
		'Mozilla/5.0 (compatible; Claude-User/1.0; +Claude-User@anthropic.com)',
		'allow',
		'user-initiated fetch',
	],
	[
		'Mozilla/5.0 (compatible; Perplexity-User/1.0)',
		'allow',
		'user-initiated fetch',
	],
	[
		'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)',
		'allow',
		'AI search crawler that links back',
	],
	[
		'Mozilla/5.0 (compatible; PerplexityBot/1.0)',
		'allow',
		'AI search crawler that links back',
	],

	// Precedence: an allowed agent naming a blocked one, or naming openai.com,
	// must still get through.
	[
		'Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)',
		'allow',
		'allowlist beats the OpenAI token',
	],

	// Search engines and archives are not AI scrapers. Blocking these was the
	// bug in the list this replaces.
	[
		'Mozilla/5.0 (compatible; Applebot/0.1; +http://www.apple.com/go/applebot)',
		'allow',
		'Apple search, not Apple Intelligence',
	],
	[
		'Mozilla/5.0 (compatible; DuckDuckBot/1.1; +http://duckduckgo.com/duckduckbot.html)',
		'allow',
		'DuckDuckGo search',
	],
	[
		'Mozilla/5.0 (compatible; special_archiver/3.2 +http://archive.org/details/archive.org_bot)',
		'allow',
		'Internet Archive',
	],
	[
		'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
		'allow',
		'Google search',
	],
	[
		'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
		'allow',
		'Bing search',
	],

	// Token boundaries. `Code` is on the list; `vscode` is not the same thing.
	['Code/1.2.3', 'block', 'Code is GitHub Copilot'],
	['Mozilla/5.0 vscode/1.2.3', 'allow', 'vscode must not match the Code token'],
	[
		'Mozilla/5.0 (compatible; Baiduspider/2.0)',
		'allow',
		'Baiduspider must not match the Spider token',
	],

	// Datadog Synthetics is hand-carried, and its two test types identify
	// differently — the second has a `/` where the token boundary falls.
	[
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 DatadogSynthetics',
		'block',
		'Datadog browser test',
	],
	['Datadog/Synthetics', 'block', 'Datadog API test'],

	// Ordinary people.
	[
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
		'allow',
		'a browser',
	],
	[
		'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
		'allow',
		'a phone',
	],
	['', 'allow', 'no user-agent header'],
];

let failures = 0;

for (const [ua, expected, why] of cases) {
	const actual = verdict(ua);
	if (actual !== expected) {
		failures += 1;
		console.error(`✗ expected ${expected}, got ${actual}: ${why}\n    ${ua}`);
	}
}

for (const [ua, expected, why] of tokenCases) {
	const actual = isBlocked(ua);
	if (actual !== expected) {
		failures += 1;
		console.error(
			`✗ expected token ${expected}, got ${String(actual)}: ${why}\n    ${ua}`,
		);
	}
}

// A token in two tiers would make robots.txt both allow and disallow it.
const tiers = new Map<string, string[]>();
for (const [tier, list] of [
	['allowedUas', allowedUas],
	['blockedUas', blockedUas],
	['robotsOnlyUas', robotsOnlyUas],
] as const) {
	for (const token of list) {
		const key = token.toLowerCase();
		tiers.set(key, [...(tiers.get(key) ?? []), tier]);
	}
}
for (const [token, found] of tiers) {
	if (found.length > 1) {
		failures += 1;
		console.error(`✗ "${token}" appears in ${found.join(' and ')}`);
	}
}

if (failures > 0) {
	console.error(`\n${failures} bot-matching check(s) failed.`);
	process.exit(1);
}

console.log(
	`Bot matching: ${cases.length} verdicts, ${tokenCases.length} token identities and ${tiers.size} tokens OK.`,
);
