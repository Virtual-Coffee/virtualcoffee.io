import Link from 'next/link';

import DefaultLayout from '@/components/layouts/DefaultLayout';

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

export const metadata = {
	title: 'You’re on the list',
	description: `You're now on the Virtual Coffee membership waiting list.`,
};

export default function Thanks() {
	return (
		<DefaultLayout simple Hero="UndrawShowingSupport">
			<div className="prose">
				<div className="lead">
					<h1>You&rsquo;re on the list</h1>
					<p>
						We read applications in batches, usually weekly. When a spot opens
						we&rsquo;ll email you an invite to a Coffee — that&rsquo;s a casual
						hour on Zoom, and the last step before joining.
					</p>
					<p>
						In the meantime, the <Link href="/newsletter">newsletter</Link> and
						the <Link href="/podcast">podcast archive</Link> are open to
						everyone.
					</p>
					<p>
						Please direct any questions you have to hello@virtualcoffee.io.
						Thanks, and we can&rsquo;t wait to meet you!
					</p>
				</div>
			</div>
		</DefaultLayout>
	);
}
