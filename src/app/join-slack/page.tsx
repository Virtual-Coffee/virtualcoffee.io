import DefaultLayout from '@/components/layouts/DefaultLayout';
import { slackInviteForToken } from '@/lib/inviteTokens';
import { single } from '@/util/searchParams';

import { FAILURES } from './copy';
import { JoinSlackForm } from './form';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Join us on Slack',
	robots: { index: false, follow: false },
};

/**
 * Checks a Slack invite token and offers the button that spends it. The
 * lookup here writes nothing: this URL is fetched by link scanners and
 * unfurlers before the person ever sees it, and each of those used to burn
 * the single-use token. The failure copy says what went wrong instead of a
 * bare error, because the people hitting it are new members who did nothing
 * wrong.
 */
export default async function JoinSlackPage({
	searchParams,
}: {
	searchParams: Promise<{ code?: string | string[] }>;
}) {
	const token = single((await searchParams).code);

	let title = 'That invite link didn’t work';
	let body: string;

	if (!token) {
		title = 'That link is missing something';
		body = 'This invite link is incomplete, so we can’t check it.';
	} else if (!process.env.SLACK_JOIN_LINK) {
		console.error(
			'SLACK_JOIN_LINK is not set; cannot complete a Slack invite.',
		);
		title = 'Something is misconfigured on our side';
		body = FAILURES.misconfigured;
	} else {
		const result = await slackInviteForToken(token);
		if (result.ok) {
			return (
				<DefaultLayout simple>
					<h1 className="h3">Welcome to Virtual Coffee</h1>
					<p>
						Your invite is ready. This link works once, so press the button when
						you&rsquo;re ready to open Slack.
					</p>
					<JoinSlackForm code={token} />
				</DefaultLayout>
			);
		}
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
