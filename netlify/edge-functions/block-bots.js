// inspired (and taken) from ethan marcotte's blog post
// https://ethanmarcotte.com/wrote/blockin-bots/
const botUas = [
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

export default async (request, context) => {
	const ua = request.headers.get('user-agent');

	let isBot = false;

	botUas.forEach((u) => {
		if (ua.toLowerCase().includes(u.toLowerCase())) {
			isBot = true;
		}
	});

	const response = isBot
		? new Response(null, { status: 401 })
		: await context.next();
	return response;
};
