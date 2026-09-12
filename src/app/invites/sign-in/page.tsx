import Link from 'next/link';
import { redirect } from 'next/navigation';

import DefaultLayout from '@/components/layouts/DefaultLayout';
import { SignInButton, SignOutButton } from '@/app/admin/sign-in/buttons';
import { getSession } from '@/lib/adminAccess';
import { slackAuthConfigured } from '@/lib/auth';
import { isVolunteer } from '@/lib/volunteerAccess';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Volunteer sign-in',
	robots: { index: false, follow: false },
};

/**
 * Sign-in for /invites. Separate from /admin/sign-in, which 404s on deploy
 * previews via `adminRoutesEnabled()`; the Slack flow itself is shared.
 */
export default async function VolunteerSignInPage({
	searchParams,
}: {
	searchParams: Promise<{ problem?: string }>;
}) {
	const session = await getSession();

	if (isVolunteer(session)) {
		const { problem } = await searchParams;

		/**
		 * `requireVolunteer()` sends someone here when they hold the role but carry
		 * no Slack member id, which would otherwise be an endless redirect: it
		 * bounces them here, this page sees a Volunteer and bounces them back.
		 */
		if (problem !== 'no-slack-id') {
			redirect('/invites');
		}

		return (
			<DefaultLayout simple>
				<h1 className="h3">We can&rsquo;t find your Slack account</h1>
				<p>
					You have Volunteer access, but we can&rsquo;t match your sign-in to a
					Slack member ID — so we can&rsquo;t tell which invites are yours.
					That&rsquo;s something we need to fix at our end.
				</p>
				<p>
					Email{' '}
					<a href="mailto:hello@virtualcoffee.io">hello@virtualcoffee.io</a> and
					we&rsquo;ll sort it out.
				</p>
				<div className="d-flex flex-wrap gap-2 mt-4">
					<Link className="btn btn-outline-secondary" href="/">
						Back to virtualcoffee.io
					</Link>
					<SignOutButton />
				</div>
			</DefaultLayout>
		);
	}

	return (
		<DefaultLayout simple>
			{session ? (
				<>
					<h1 className="h3">You don&rsquo;t have invites to give out</h1>
					<p>
						Signed in as <strong>{session.user.email}</strong>. Sending invites
						is for active volunteers. If you volunteer with Virtual Coffee and
						think this is wrong, ask a maintainer to set you up.
					</p>
					<div className="d-flex flex-wrap gap-2 mt-4">
						<Link className="btn btn-outline-secondary" href="/">
							Back to virtualcoffee.io
						</Link>
						<SignOutButton />
					</div>
				</>
			) : (
				<>
					<h1 className="h3">Volunteer sign-in</h1>
					<p>Inviting people uses your Virtual Coffee Slack account.</p>
					{slackAuthConfigured ? (
						<SignInButton callbackURL="/invites" />
					) : (
						<div className="alert alert-warning" role="alert">
							<h2 className="h6 alert-heading">
								Slack sign-in isn&rsquo;t configured
							</h2>
							<p className="mb-0">
								<code>SLACK_CLIENT_ID</code> and{' '}
								<code>SLACK_CLIENT_SECRET</code> are not set, so there&rsquo;s
								nothing to sign in to. This is expected on a fresh clone — see{' '}
								<code>.env.example</code>.
							</p>
						</div>
					)}
				</>
			)}
		</DefaultLayout>
	);
}
