import fs from 'fs';
import path from 'path';
import {
	allowedFunctions,
	alwaysAllow,
	alwaysBlock,
	extraBlocked,
	robotsOnly,
} from '../src/data/botOverrides';

/**
 * Generates `src/data/bots.ts` from ai-robots-txt/ai.robots.txt.
 *
 * The list it replaces was copied from a blog post in 2024 and never updated:
 * it missed ~150 crawlers that have appeared since, and blocked nine things
 * that were never AI scrapers at all (Apple's search crawler, DuckDuckGo,
 * Marginalia, the Internet Archive, a synthetic-monitoring agent).
 *
 * Unlike the other codegen here, the output is **checked in**. A build-time
 * fetch would put a GitHub outage between us and a working deploy, and the
 * edge function needs the file to exist for Deno to bundle it. Committing it
 * also means every change to who we block shows up in a diff someone reviews.
 *
 * Policy lives in `src/data/botOverrides.ts`. Run with `pnpm build-bot-list`.
 */

const SOURCE =
	'https://raw.githubusercontent.com/ai-robots-txt/ai.robots.txt/main/robots.json';

const outFile = path.join('.', 'src', 'data', 'bots.ts');

type Agent = {
	function?: string;
	frequency?: string;
};

/**
 * Upstream lists some agents with a version attached (`MistralAI-User/1.0`,
 * `Brightbot 1.0`). Match on the product token; the version is noise.
 */
function normalize(token: string) {
	return token
		.replace(/\/.*$/, '')
		.replace(/\s+\d+(\.\d+)*$/, '')
		.trim();
}

/** Case-insensitive dedupe that keeps the first spelling seen, then sorts. */
function tidy(tokens: string[]) {
	const seen = new Map<string, string>();
	for (const token of tokens) {
		const key = token.toLowerCase();
		if (!seen.has(key)) seen.set(key, token);
	}
	return [...seen.values()].sort((a, b) =>
		a.toLowerCase().localeCompare(b.toLowerCase()),
	);
}

function serialize(name: string, doc: string, tokens: string[]) {
	const entries = tokens.map((token) => `\t'${token.replace(/'/g, "\\'")}',`);
	return `${doc}\nexport const ${name} = [\n${entries.join('\n')}\n];\n`;
}

async function main() {
	const response = await fetch(SOURCE);
	if (!response.ok) {
		throw new Error(`${SOURCE} responded ${response.status}`);
	}
	const agents: Record<string, Agent> = await response.json();

	const lowerSet = (list: string[]) =>
		new Set(list.map((token) => token.toLowerCase()));
	const allowSet = lowerSet(alwaysAllow);
	const blockSet = lowerSet(alwaysBlock);
	const extraSet = lowerSet(extraBlocked);
	const robotsOnlySet = lowerSet(robotsOnly);

	// Upstream lists some agents more than once — `MistralAI-User` and
	// `MistralAI-User/1.0` are separate keys with different `function` values,
	// and normalising collapses them. Collect every category a token is filed
	// under first, then decide its tier once, so nothing lands in two lists.
	const collected = new Map<string, { token: string; functions: string[] }>();

	for (const [rawToken, agent] of Object.entries(agents)) {
		const token = normalize(rawToken);
		if (!token) continue;

		const key = token.toLowerCase();
		const entry = collected.get(key) ?? { token, functions: [] };
		entry.functions.push(agent.function ?? '');
		collected.set(key, entry);
	}

	const blocked: string[] = [];
	const allowed: string[] = [];
	const signals: string[] = [];
	const unrecognised: string[] = [];

	for (const [key, { token, functions }] of collected) {
		if (robotsOnlySet.has(key)) {
			signals.push(token);
			continue;
		}
		// `extraBlocked` is checked here, not only appended afterwards: if
		// upstream later files one of these under an allowed category, the
		// explicit decision to block it has to win over the derived tier.
		if (blockSet.has(key) || extraSet.has(key)) {
			blocked.push(token);
			continue;
		}
		if (allowSet.has(key)) {
			allowed.push(token);
			continue;
		}

		// Where a token is filed under several categories, the most permissive
		// one wins: upstream disagreeing with itself is not grounds for us to
		// block an agent it also calls an assistant.
		if (functions.some((category) => allowedFunctions.includes(category))) {
			allowed.push(token);
			continue;
		}

		// Everything else is blocked. Upstream's `function` is free prose for
		// most entries, so this is the common path, not an error — but an
		// unrecognised category is worth seeing, in case a new one deserves
		// allowing.
		const category = functions.find(Boolean) ?? '';
		if (!/scrape|train|data|llm|ai |crawl|model/i.test(category)) {
			unrecognised.push(`${token} — ${category || 'no function given'}`);
		}
		blocked.push(token);
	}

	// Scrapers upstream doesn't track, carried over from the list this replaces.
	for (const token of extraBlocked) {
		if (!collected.has(token.toLowerCase())) blocked.push(token);
	}

	// An override that doesn't reach the tier it names is the failure this
	// design is most exposed to: botOverrides.ts is meant to be the readable
	// policy, and the weekly refresh PR is the only place anyone reviews it.
	// A line that quietly does nothing is worse than no line at all.
	const landedIn = new Map<string, string>();
	for (const [tier, list] of [
		['blockedUas', blocked],
		['allowedUas', allowed],
		['robotsOnlyUas', signals],
	] as const) {
		for (const token of list) landedIn.set(token.toLowerCase(), tier);
	}

	const misplaced: string[] = [];
	const inert: string[] = [];

	for (const [name, tokens, expected] of [
		['alwaysAllow', alwaysAllow, 'allowedUas'],
		['alwaysBlock', alwaysBlock, 'blockedUas'],
		['extraBlocked', extraBlocked, 'blockedUas'],
		['robotsOnly', robotsOnly, 'robotsOnlyUas'],
	] as const) {
		for (const token of tokens) {
			const actual = landedIn.get(token.toLowerCase());
			if (!actual) {
				inert.push(`${name}: ${token} — no longer in upstream's list`);
			} else if (actual !== expected) {
				misplaced.push(
					`${name}: ${token} — landed in ${actual}, not ${expected}`,
				);
			}
		}
	}

	const banner = `// Generated by \`pnpm build-bot-list\`. Do not edit by hand — change
// src/data/botOverrides.ts and regenerate.
//
// Source: ai-robots-txt/ai.robots.txt (robots.json).
//
// Keep this module free of imports — netlify/edge-functions/block-bots.ts
// bundles it for Deno, which has no Node built-ins.
`;

	const file = [
		banner,
		serialize(
			'blockedUas',
			`/**\n * Crawlers that harvest the site. Disallowed in robots.txt and enforced\n * at the edge.\n */`,
			tidy(blocked),
		),
		serialize(
			'allowedUas',
			`/**\n * AI search crawlers and agents fetching a page because a person asked for\n * it. Checked before ${'`blockedUas`'} at the edge, and allowed in robots.txt.\n */`,
			tidy(allowed),
		),
		serialize(
			'robotsOnlyUas',
			`/**\n * Opt-out directives rather than user agents — they never appear in a\n * User-Agent header, so they go in robots.txt and nowhere else.\n */`,
			tidy(signals),
		),
	].join('\n');

	fs.writeFileSync(outFile, file);

	console.log(
		`Wrote ${outFile}: ${tidy(blocked).length} blocked, ${
			tidy(allowed).length
		} allowed, ${tidy(signals).length} robots.txt-only.`,
	);

	if (unrecognised.length > 0) {
		console.log(
			`\nBlocked by default, category not recognised (${unrecognised.length}):`,
		);
		for (const entry of unrecognised.sort()) console.log(`  ${entry}`);
	}

	// Warned, not fatal: upstream dropping a token leaves our line doing
	// nothing, which is worth seeing in the refresh PR, but is not a reason to
	// stop shipping the rest of the list.
	if (inert.length > 0) {
		console.log(`\nOverrides with nothing to act on (${inert.length}):`);
		for (const entry of inert.sort()) console.log(`  ${entry}`);
	}

	// Fatal: an override landing in the wrong tier changes who we block. The
	// only way to reach this is contradictory policy in botOverrides.ts, or a
	// change to the precedence above that broke one of the overrides.
	if (misplaced.length > 0) {
		console.error(`\nOverrides in the wrong tier (${misplaced.length}):`);
		for (const entry of misplaced.sort()) console.error(`  ${entry}`);
		console.error('\nFix src/data/botOverrides.ts and regenerate.');
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
