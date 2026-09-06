import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';
import Link from 'next/link';

import { JoinForm } from './form';

// The form posts to a server action, so this page can't be statically cached
// the way it was when it only linked out to a hosted Airtable form.
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
	return await createMetaData({
		title: 'Join Virtual Coffee',
		description: `Virtual Coffee is an intimate community that welcomes people at all stages of their tech journey.`,
		Hero: 'UndrawTeamSpirit',
	});
}

export default function Join() {
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

				<h2>Join the waitlist</h2>
				<p>
					Tell us a bit about you and we&rsquo;ll be in touch when a spot opens.
				</p>

				<JoinForm />
			</div>
		</DefaultLayout>
	);
}
