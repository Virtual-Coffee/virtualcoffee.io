/**
 * Policy for the generated bot list.
 *
 * `scripts/loadBotList.ts` reads this at generation time and bakes the result
 * into `src/data/bots.ts`. Nothing at runtime imports it, so it is free to be
 * as expressive as it likes — the generated file is the flat, Deno-bundleable
 * one.
 *
 * Upstream (ai-robots-txt/ai.robots.txt) is a single "block all AI" list. The
 * tiering below is ours: we block crawlers that harvest the site to train on
 * it, and allow ones that fetch a page to answer a person's question, because
 * an AI answer that links to virtualcoffee.io sends someone to the community.
 */

/**
 * Upstream `function` values that mean "a person is waiting on this fetch", or
 * "this indexes us so we can be cited". Everything else defaults to blocked,
 * so a new upstream category is blocked until someone reads it.
 */
export const allowedFunctions = ['AI Search Crawlers', 'AI Assistants'];

/**
 * Allowed no matter how upstream categorises them.
 *
 * Most of these are AI search crawlers that upstream describes in prose rather
 * than with its `AI Search Crawlers` label, so the derived tier misses them.
 * They are the ones most likely to cite us, which is the whole reason the
 * allowed tier exists.
 */
export const alwaysAllow = [
	// Powers Siri, Spotlight and Safari suggestions. `Applebot-Extended` is the
	// AI-training opt-out and is listed separately; blocking plain Applebot
	// costs Apple search visibility and buys nothing. The hand-written list it
	// replaces did exactly that for two years.
	'Applebot',
	// Search indexes that answer questions with a link back.
	'OAI-SearchBot',
	'PerplexityBot',
	'Claude-SearchBot',
	// Mistral state this indexes for Le Chat's search and is not used for
	// training.
	'MistralAI-Index',
	// Not an AI crawler at all: it is the link-preview fetcher behind Facebook,
	// Instagram and WhatsApp. Blocking it means a VC link shared anywhere in
	// that family unfurls as a bare URL.
	'facebookexternalhit',
];

/**
 * Blocked despite landing in an allowed category upstream. Each of these is
 * filed as an assistant but behaves like a harvester.
 */
export const alwaysBlock = [
	// Upstream records its frequency as "Unhinged, more than 1 per second".
	'meta-webindexer',
	// Bulk evaluation crawling, not a fetch anyone is waiting on.
	'AI2Bot-DeepResearchEval',
	// Marketing automation indexing on "change signals", not a person's query.
	'KlaviyoAIBot',
	// Lead generation.
	'QualifiedBot',
];

/**
 * Blocked, but absent from upstream. These are carried over from the
 * hand-written list this replaces — upstream tracks AI crawlers, and these are
 * SEO, brand-monitoring and ad-targeting scrapers that VC had already decided
 * about. Dropping them on the move would have quietly reopened the site to
 * them.
 *
 * `Awario` *is* upstream, but token-boundary matching means it does not cover
 * `AwarioRssBot` or `AwarioSmartBot`, so both are named here.
 */
export const extraBlocked = [
	'AwarioRssBot',
	'AwarioSmartBot',
	'DataForSeoBot',
	'magpie-crawler',
	'peer39_crawler',
	'DatadogSynthetics',
];

/**
 * Tokens that are robots.txt opt-out directives rather than user agents. They
 * never appear in a `User-Agent` header, so enforcing them at the edge is a
 * no-op that only makes the blocklist harder to read.
 *
 * Keep this list conservative: marking a real crawler as robots-only silently
 * stops enforcing it.
 */
export const robotsOnly = [
	'Google-Extended',
	'Applebot-Extended',
	'Webzio-Extended',
	'webzio-extended',
	'YandexAdditional',
	'YandexAdditionalBot',
];
