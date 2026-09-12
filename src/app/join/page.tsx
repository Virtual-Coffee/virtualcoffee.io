import DefaultLayout from '@/components/layouts/DefaultLayout';
import { inviteForClaimToken } from '@/lib/invites';
import { createMetaData } from '@/util/createMetaData.server';
import { issueTimestamp } from '@/util/forms/spamGuard';
import { single } from '@/util/searchParams';
import Link from 'next/link';

import { JoinForm } from './form';

// The spam guard signs a per-render token that prerendering would bake in.
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
	return await createMetaData({
		title: 'Join Virtual Coffee',
		description: `Virtual Coffee is an intimate community that welcomes people at all stages of their tech journey.`,
		Hero: 'UndrawTeamSpirit',
	});
}

export default async function Join({
	searchParams,
}: {
	searchParams: Promise<{ invite?: string | string[] }>;
}) {
	const invite = single((await searchParams).invite);

	/**
	 * Looking the Claim Link up here does not spend it — someone can open the
	 * link, close the tab and come back. An unknown, used or expired token
	 * resolves to null and the page is the ordinary waitlist form, which is also
	 * what the action falls back to.
	 */
	const claimed = invite ? await inviteForClaimToken(invite) : null;

	return (
		<DefaultLayout
			simple
			Hero="UndrawTeamSpirit"
			heroHeader="Join Virtual Coffee"
			heroSubheader="Learn how to join our community"
		>
			<div className="prose">
				<div className="lead mb-5">
					<p>
						Virtual Coffee is a community that welcomes people at all stages of
						their tech journey. Our mission is to be a welcoming tech community
						that allows room for growth and mentorship at all levels and to
						create meaningful opportunities for learning, leadership, and
						contribution for everyone.
					</p>
					<p>
						We keep the group small on purpose, so there&rsquo;s a waitlist. We
						intentionally keep it that way to preserve what makes Virtual Coffee
						special and support our existing members. As new membership becomes
						available, we&rsquo;ll reach out to those on the waitlist to join.
					</p>
					<p>
						In the meantime, feel free to check out the{' '}
						<Link href="/resources/virtual-coffee-handbook/join-virtual-coffee">
							FAQ about joining Virtual Coffee
						</Link>
						.
					</p>
				</div>

				{claimed ? (
					<>
						<h2>You&rsquo;ve been invited</h2>
						<p>
							{claimed.inviterName ?? 'A Virtual Coffee volunteer'} invited you,
							so you skip the waitlist — we&rsquo;ll look at your answers first.
							We still need them, and we still need you to read the Code of
							Conduct.
						</p>
					</>
				) : (
					<>
						<h2>Join the waitlist</h2>
						<p>
							Tell us a bit about you and we&rsquo;ll be in touch when a spot
							opens.
						</p>
					</>
				)}

				<JoinForm
					spamToken={issueTimestamp()}
					claimToken={claimed ? invite : undefined}
					defaultName={claimed?.inviteeName ?? undefined}
					defaultEmail={claimed?.inviteeEmail ?? undefined}
				/>
			</div>
		</DefaultLayout>
	);
}
