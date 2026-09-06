import { type NextRequest } from 'next/server';

import { redeemSlackInviteToken } from '@/lib/inviteTokens';

export const dynamic = 'force-dynamic';

/**
 * Redeems a Slack invite token and forwards to the workspace join link.
 *
 * This replaces `netlify/functions/join-slack.ts`, which accepted any
 * non-empty `code`, never expired one, and only logged it — so a single
 * forwarded email handed out indefinite access. It moved into the app because
 * validation needs the database, which the Netlify function bundle can't
 * reach.
 *
 * Links issued before this shipped will no longer work, which is the point;
 * the failure page says so plainly instead of returning a bare 401, because
 * the people hitting it are new members who did nothing wrong.
 */

function page(title: string, body: string, status: number) {
	return new Response(
		`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title} · Virtual Coffee</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 3rem 1.5rem;
         line-height: 1.5; color: #23202c; background: #fdfdfd; }
  main { max-width: 34rem; margin: 0 auto; }
  a { color: #2f5d8a; }
</style>
</head>
<body>
<main>
  <h1>${title}</h1>
  <p>${body}</p>
  <p>Email <a href="mailto:hello@virtualcoffee.io">hello@virtualcoffee.io</a> and we'll sort you out.</p>
</main>
</body>
</html>`,
		{
			status,
			headers: {
				'content-type': 'text/html; charset=utf-8',
				'cache-control': 'no-store',
			},
		},
	);
}

export async function GET(request: NextRequest) {
	const code = request.nextUrl.searchParams.get('code');

	if (!code) {
		return page(
			'That link is missing something',
			'This invite link is incomplete, so we can’t check it.',
			400,
		);
	}

	const joinLink = process.env.SLACK_JOIN_LINK;
	if (!joinLink) {
		console.error(
			'SLACK_JOIN_LINK is not set; cannot complete a Slack invite.',
		);
		return page(
			'Something is misconfigured on our side',
			'Your invite is valid, but we can’t forward you to Slack right now.',
			500,
		);
	}

	const result = await redeemSlackInviteToken(code);

	if (!result.ok) {
		const messages = {
			unknown:
				'We don’t recognise this invite link. It may be from an older invite.',
			used: 'This invite link has already been used. Invites work once, on purpose.',
			expired: 'This invite link has expired.',
		};
		return page('That invite link didn’t work', messages[result.reason], 410);
	}

	return Response.redirect(joinLink, 302);
}
