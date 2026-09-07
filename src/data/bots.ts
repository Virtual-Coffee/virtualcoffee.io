// The one bot list. Consumed by src/app/robots.ts (the polite request) and
// netlify/edge-functions/block-bots.ts (enforcement). Keep this module free of
// imports — the edge function bundles it for Deno, which has no Node built-ins.
//
// inspired (and taken) from ethan marcotte's blog post
// https://ethanmarcotte.com/wrote/blockin-bots/
export const botUas = [
	'Amazonbot',
	'anthropic-ai',
	'Applebot-Extended',
	'Bytespider',
	'CCBot',
	'ChatGPT-User',
	'ClaudeBot',
	'Claude-Web',
	'cohere-ai',
	'DatadogSynthetics',
	'Diffbot',
	'DuckDuckBot',
	'FacebookBot',
	'FriendlyCrawler',
	'Google-Extended',
	'GoogleOther',
	'GoogleOther-Image',
	'GoogleOther-Video',
	'GPTBot',
	'ia_archiver',
	'ImagesiftBot',
	'img2dataset',
	'Meta-ExternalAgent',
	'OAI-SearchBot',
	'omgili',
	'omgilibot',
	'PerplexityBot',
	'search.marginalia.nu',
	'StractBot',
	'Trove',
	'Yandex',
	'YouBot',
	'AdsBot-Google',
	'Applebot',
	'AwarioRssBot',
	'AwarioSmartBot',
	'ChatGPT',
	'DataForSeoBot',
	'magpie-crawler',
	'Omgilibot',
	'peer39_crawler',
];

// Agents that fetch a page because a human asked for it right now, rather than
// harvesting the site. Checked before botUas and wins, so a broad entry there
// (`ChatGPT` also matches `ChatGPT-User`) can't swallow them. Also subtracted
// from robots.txt, without which these agents decline to fetch anyway.
export const userInitiatedUas = [
	'Claude-User',
	'ChatGPT-User',
	'Perplexity-User',
	'OAI-SearchBot',
];
