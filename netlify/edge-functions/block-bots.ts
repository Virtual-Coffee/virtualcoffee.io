import type { EdgeFunction } from '@netlify/edge-functions';
import { allowedUas, blockedUas } from '../../src/data/bots.ts';
import { createBotPolicy } from '../../src/data/botMatcher.ts';

// Netlify reports one of these as `context.deploy.context` on a real deploy,
// and `dev` under `netlify dev`. Test for a deploy positively — there is
// nothing to protect on a laptop, and a silent 403 there reads as an auth bug.
//
// Read it from the context object, not `Netlify.env.get('CONTEXT')`: that is
// a build-scope variable and is undefined at the edge, which made this gate
// fail closed on every production request.
const deployContexts = ['production', 'deploy-preview', 'branch-deploy'];

// Built once at module load rather than per request. The precedence rule
// (allowed wins) lives with the matcher so `botMatcher.test.ts` exercises the
// same function this runs.
const policy = createBotPolicy(allowedUas, blockedUas);

// Returning undefined bypasses the edge function, so there is nothing here to
// await.
const blockBots: EdgeFunction = (request, context) => {
	const ua = request.headers.get('user-agent') ?? '';

	const decision = policy(ua);
	if (decision.verdict === 'allow') return;
	const { token } = decision;

	// Matching runs before the deploy gate so that local dev still reports what
	// production would refuse, just under a different tag.
	const onDeploy = deployContexts.includes(context.deploy.context);
	const enforce = onDeploy || Netlify.env.get('BLOCK_BOTS_LOCAL') === 'true';

	// One line per refusal. The list changes weekly and the gate above once
	// failed silently for weeks; this is the cheapest evidence the block works.
	// The UA goes last, quoted, because it is the one free-text field.
	const { method } = request;
	const { pathname } = new URL(request.url);
	console.log(
		`[${enforce ? 'blocked' : 'dev bypass'}] ${token} ${method} ${pathname} ip=${context.ip} req=${context.requestId} ua=${JSON.stringify(ua)}`,
	);

	if (!enforce) return;

	return new Response(
		'Automated crawling of virtualcoffee.io is not permitted. See /robots.txt\n',
		{ status: 403, headers: { 'content-type': 'text/plain; charset=utf-8' } },
	);
};

export default blockBots;
