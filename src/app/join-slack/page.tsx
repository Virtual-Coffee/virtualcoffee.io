import { redirect } from 'next/navigation';

import DefaultLayout from '@/components/layouts/DefaultLayout';
import { redeemSlackInviteToken } from '@/lib/inviteTokens';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Join us on Slack',
	robots: { index: false, follow: false },
};

const FAILURES = {
	unknown:
		'We don’t recognise this invite link. It may be from an older invite.',
	used: 'This invite link has already been used. Invites work once, on purpose.',
	expired: 'This invite link has expired.',
};

/**
 * Redeems a Slack invite token and forwards to the workspace join link. The
 * failure page says what went wrong instead of a bare error: the people
 * hitting it are new members who did nothing wrong.
 */
export default async function JoinSlackPage({
	searchParams,
}: {
	searchParams: Promise<{ code?: string | string[] }>;
}) {
	const { code } = await searchParams;
	const token = Array.isArray(code) ? code[0] : code;

	const joinLink = process.env.SLACK_JOIN_LINK;
	let title = 'That invite link didn’t work';
	let body: string;

	if (!token) {
		title = 'That link is missing something';
		body = 'This invite link is incomplete, so we can’t check it.';
	} else if (!joinLink) {
		// Checked before redeeming, so a misconfigured deploy does not burn the
		// single-use token.
		console.error(
			'SLACK_JOIN_LINK is not set; cannot complete a Slack invite.',
		);
		title = 'Something is misconfigured on our side';
		body = 'Your invite is valid, but we can’t forward you to Slack right now.';
	} else {
		const result = await redeemSlackInviteToken(token);
		if (result.ok) redirect(joinLink);
		body = FAILURES[result.reason];
	}

	return (
		<DefaultLayout simple>
			<h1 className="h3">{title}</h1>
			<p>{body}</p>
			<p>
				Email <a href="mailto:hello@virtualcoffee.io">hello@virtualcoffee.io</a>{' '}
				and we&rsquo;ll sort you out.
			</p>
		</DefaultLayout>
	);
}
