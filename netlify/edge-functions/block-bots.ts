import type { EdgeFunction } from '@netlify/edge-functions';
import { allowedUas, blockedUas } from '../../src/data/bots.ts';
import { createBotMatcher } from '../../src/data/botMatcher.ts';

// Netlify sets CONTEXT to one of these on a real deploy and leaves it unset
// under `netlify dev`. Test for a deploy positively — there is nothing to
// protect on a laptop, and a silent 403 there reads as an auth bug.
const deployContexts = ['production', 'deploy-preview', 'branch-deploy'];

// Built once at module load rather than per request.
const isAllowed = createBotMatcher(allowedUas);
const isBlocked = createBotMatcher(blockedUas);

// Returning undefined bypasses the edge function, so there is no use for the
// `context` argument and nothing here to await.
const blockBots: EdgeFunction = (request) => {
	const onDeploy = deployContexts.includes(Netlify.env.get('CONTEXT') ?? '');
	if (!onDeploy && Netlify.env.get('BLOCK_BOTS_LOCAL') !== 'true') return;

	const ua = request.headers.get('user-agent') ?? '';

	// Allowed wins. An agent fetching a page because someone asked for it is a
	// person reading the site through a different client, and several of them
	// name openai.com or a sibling crawler in the same string.
	if (isAllowed(ua)) return;
	if (!isBlocked(ua)) return;

	return new Response(
		'Automated crawling of virtualcoffee.io is not permitted. See /robots.txt\n',
		{ status: 403, headers: { 'content-type': 'text/plain; charset=utf-8' } },
	);
};

export default blockBots;
