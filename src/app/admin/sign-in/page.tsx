import Link from 'next/link';
import { redirect } from 'next/navigation';

import DefaultLayout from '@/components/layouts/DefaultLayout';
import { SignInButton, SignOutButton } from '@/app/admin/sign-in/buttons';
import { getSession, visibleSections } from '@/lib/access/adminAccess';
import { slackAuthConfigured, slackTeamId } from '@/lib/access/auth';
import { isVolunteer } from '@/lib/access/volunteerAccess';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Maintainer sign-in',
	robots: { index: false, follow: false },
};

export default async function AdminSignInPage() {
	const session = await getSession();

	// Holding a permission on any section is enough to get in — a maintainer who
	// only reviews Lunch & Learn ideas should not be told they are "not an admin".
	if (visibleSections(session).length > 0) {
		redirect('/admin');
	}

	/**
	 * A Volunteer holds no Section, so the check above is false for them and
	 * they would land on "you're signed in, but not an admin" — which is true
	 * and useless. They have somewhere to be.
	 */
	if (isVolunteer(session)) {
		redirect('/invites');
	}

	return (
		<DefaultLayout simple>
			{session ? (
				<>
					<h1 className="h3">You&rsquo;re signed in, but not an admin</h1>
					<p>
						Signed in as <strong>{session.user.email}</strong>. This area is
						limited to maintainers. If you think that&rsquo;s wrong, ask an
						existing admin to add you.
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
					<h1 className="h3">Maintainer sign-in</h1>
					<p>Admin uses your Virtual Coffee Slack account.</p>
					{slackAuthConfigured ? (
						<SignInButton teamId={slackTeamId} />
					) : (
						<div className="alert alert-warning" role="alert">
							<h2 className="h6 alert-heading">
								Slack sign-in isn&rsquo;t configured
							</h2>
							<p className="mb-0">
								<code>SLACK_CLIENT_ID</code>, <code>SLACK_CLIENT_SECRET</code>{' '}
								and <code>SLACK_TEAM_ID</code> are not all set, so there&rsquo;s
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
