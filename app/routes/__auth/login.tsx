import {
	Form,
	useActionData,
	useCatch,
	Link,
	useLoaderData,
} from '@remix-run/react';
import { json } from '@remix-run/node';
import type { ActionArgs, LoaderArgs, TypedResponse } from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';
import { AuthorizationError } from 'remix-auth';
import SingleTask from '~/components/layouts/SingleTask';
import Alert from '~/components/app/Alert';
import { Button } from '~/components/app/Button';
import { TextInput } from '~/components/app/Forms';
import { readFlashCookie } from '~/auth/session.server';
import { MessageCode, type SessionFlash } from '~/auth/types';
export { metaFromData as meta } from '~/util/remixHelpers';

function LogInForm({
	sessionFlash,
	error,
	redirectOnSuccess,
}: {
	sessionFlash?: SessionFlash | null;
	error?: string;
	redirectOnSuccess?: string | null;
}) {
	let defaultEmail;
	if (
		sessionFlash &&
		sessionFlash.messageCode === MessageCode.LoginEmailPrefill
	) {
		defaultEmail = sessionFlash.data.email;
	}
	return (
		<SingleTask title="Sign in to your account">
			<Form
				className="space-y-6"
				method="post"
				reloadDocument
				action={`/login${
					redirectOnSuccess ? '?redirectOnSuccess=' + redirectOnSuccess : ''
				}`}
			>
				{sessionFlash &&
					sessionFlash.messageCode === MessageCode.LoginEmailPrefill && (
						<Alert title="We found your account!" type="success">
							<p>
								Please log in with the same credentials you use to log in to{' '}
								<a
									className="underline"
									href="https://members.virtualcoffee.io"
								>
									the CMS
								</a>
								.
							</p>
						</Alert>
					)}
				{error && (
					<Alert title="There was an error signing you in." type="danger">
						<p>{error}</p>
						{error === 'Please activate your account before logging in' && (
							<p>
								<Link to="/resend-activation" className="underline">
									Resend Activation Email
								</Link>
							</p>
						)}
					</Alert>
				)}
				{redirectOnSuccess && (
					<Alert type="info" title="Please log in to see this content." />
				)}

				<TextInput
					label="Email address"
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					defaultValue={defaultEmail}
					required
				/>

				<TextInput
					label="Password"
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
				/>

				<div className="flex items-center justify-end">
					<div className="text-sm">
						<Link
							to="/register"
							className="font-medium text-sky-600 hover:text-sky-500"
						>
							Register
						</Link>
					</div>
				</div>

				<div className="flex items-center justify-end">
					<div className="text-sm">
						<Link
							to="/forgot-password"
							className="font-medium text-sky-600 hover:text-sky-500"
						>
							Forgot your password?
						</Link>
					</div>
				</div>

				<div>
					<Button type="submit" fullWidth>
						Sign In
					</Button>
				</div>
			</Form>
		</SingleTask>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	console.log({ caught });

	return <LogInForm error={caught.data} />;
}

export let action = async ({
	request,
}: ActionArgs): Promise<TypedResponse<{ message: string }>> => {
	// we call the method with the name of the strategy we want to use and the
	// request object, optionally we pass an object with the URLs we want the user
	// to be redirected to after a success or a failure

	const url = new URL(request.url);
	const redirectOnSuccess = url.searchParams.get('redirectOnSuccess');

	try {
		await authenticator.authenticate('user-pass', request, {
			successRedirect: redirectOnSuccess || '/membership',
		});
		throw new Error('Unknown error');
	} catch (error) {
		// Because redirects work by throwing a Response, you need to check if the
		// caught error is a response and return it or throw it again
		if (error instanceof Response) {
			return error;
		}
		if (error instanceof AuthorizationError) {
			return json({ message: error.message });
			// here the error is related to the authentication process
		}
		// here the error is a generic error that another reason may throw
		console.log('is generic error');
		console.log(error);
		return json({ message: 'There was a server error.' });
	}
};

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
export let loader = async ({ request }: LoaderArgs) => {
	const url = new URL(request.url);
	const redirectOnSuccess = url.searchParams.get('redirectOnSuccess');

	// isAuthenticated throws a redirect if already logged in
	await authenticator.isAuthenticated(request, {
		successRedirect: redirectOnSuccess || '/membership',
	});

	const sessionFlashCheck = await readFlashCookie(request);

	const meta = {
		title: 'Log In',
		description: ``,
	};

	if (sessionFlashCheck) {
		if (sessionFlashCheck.sessionFlash) {
			return json(
				{ sessionFlash: sessionFlashCheck.sessionFlash, meta },
				{
					headers: {
						// only necessary with cookieSessionStorage
						'Set-Cookie': sessionFlashCheck.cookie,
					},
				},
			);
		} else {
			return json(
				{ sessionFlash: null },
				{
					headers: {
						// only necessary with cookieSessionStorage
						'Set-Cookie': sessionFlashCheck.cookie,
					},
				},
			);
		}
	}
	return json({ sessionFlash: null, meta });
};

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
	const { sessionFlash } = useLoaderData<typeof loader>() as unknown as {
		sessionFlash: SessionFlash | null;
	};

	const actionData = useActionData<typeof action>();

	return <LogInForm error={actionData?.message} sessionFlash={sessionFlash} />;
}
