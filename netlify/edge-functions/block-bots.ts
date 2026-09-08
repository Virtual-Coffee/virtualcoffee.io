import type { EdgeFunction } from '@netlify/edge-functions';
import { botUas, userInitiatedUas } from '../../src/data/bots.ts';

// Netlify sets CONTEXT to one of these on a real deploy and leaves it unset
// under `netlify dev`. Test for a deploy positively — there is nothing to
// protect on a laptop, and a silent 401 there reads as an auth bug.
const deployContexts = ['production', 'deploy-preview', 'branch-deploy'];

const matches = (ua: string, list: string[]) =>
	list.some((u) => ua.includes(u.toLowerCase()));

// Returning undefined bypasses the edge function, so there is no use for the
// `context` argument and nothing here to await.
const blockBots: EdgeFunction = (request) => {
	const onDeploy = deployContexts.includes(Netlify.env.get('CONTEXT') ?? '');
	if (!onDeploy && Netlify.env.get('BLOCK_BOTS_LOCAL') !== 'true') return;

	const ua = (request.headers.get('user-agent') ?? '').toLowerCase();
	if (matches(ua, userInitiatedUas)) return;
	if (!matches(ua, botUas)) return;

	return new Response(
		'Automated crawling of virtualcoffee.io is not permitted. See /robots.txt\n',
		{ status: 403, headers: { 'content-type': 'text/plain; charset=utf-8' } },
	);
};

export default blockBots;
