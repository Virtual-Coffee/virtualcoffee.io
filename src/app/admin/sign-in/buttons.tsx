'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { signIn, signOut } from '@/lib/auth-client';

/**
 * `callbackURL` is where Slack sends them back to. It defaults to /admin, but
 * /invites signs its own visitors in: a Volunteer holds no Section, so landing
 * them on /admin would bounce them straight back out to this page.
 */
export function SignInButton({
	callbackURL = '/admin',
}: {
	callbackURL?: string;
}) {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	return (
		<>
			{error && (
				<div className="alert alert-danger" role="alert">
					{error}
				</div>
			)}
			<button
				type="button"
				className="btn btn-primary btn-lg"
				disabled={pending}
				onClick={async () => {
					setPending(true);
					setError(null);
					const result = await signIn.social({
						provider: 'slack',
						callbackURL,
					});
					if (result?.error) {
						// Most likely cause is a Slack account outside the Virtual Coffee
						// workspace, which the provider rejects during profile mapping.
						setError(result.error.message ?? 'Could not sign in with Slack.');
						setPending(false);
					}
				}}
			>
				{pending ? 'Redirecting…' : 'Sign in with Slack'}
			</button>
		</>
	);
}

export function SignOutButton() {
	const router = useRouter();

	return (
		<button
			type="button"
			className="btn btn-outline-danger"
			onClick={async () => {
				await signOut();
				router.refresh();
			}}
		>
			Sign out
		</button>
	);
}
