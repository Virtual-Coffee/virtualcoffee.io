import { Form, useActionData, useCatch } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import type { ActionArgs } from '@remix-run/node';
import { CmsActions } from '~/api/cms.server';
import SingleTask from '~/components/layouts/SingleTask';
import Alert from '~/components/app/Alert';
import { Button } from '~/components/app/Button';
import { TextInput } from '~/components/app/Forms';
import {
	lookUpByEmail,
	type UsersLookupByEmailResponse,
} from '~/api/slack.server';
import { createFlashCookie } from '~/auth/session.server';
import { MessageCode, type SlackUser } from '~/auth/types';

function CurrentMemberForm({ error }: { error?: string }) {
	return (
		<SingleTask title="Sign in to your account">
			<Form className="space-y-6" method="post">
				{error && (
					<Alert title="There was an error signing you in." type="danger">
						<p>{error}</p>
					</Alert>
				)}

				<TextInput
					label="Email address"
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					help="Please use the email address you used to sign up for the Virtual Coffee Slack workspace."
					required
				/>

				<div>
					<Button type="submit" fullWidth>
						Register
					</Button>
				</div>
			</Form>
		</SingleTask>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	console.log({ caught });

	return <CurrentMemberForm error={caught.data} />;
}

const badRequest = (message: string) => json({ message }, { status: 400 });

export let action = async ({ request }: ActionArgs) => {
	// we call the method with the name of the strategy we want to use and the
	// request object, optionally we pass an object with the URLs we want the user
	// to be redirected to after a success or a failure

	try {
		const form = await request.formData();

		const email = form.get('email');

		if (!email) {
			return badRequest('Please enter an email address');
		}

		if (!(typeof email === 'string')) {
			return badRequest('Please enter a valid email address');
		}

		const api = new CmsActions();

		// check if user is already registered
		const user = await api.getUserProfile({ email });

		if (user) {
			return redirect('/login', {
				headers: {
					'Set-Cookie': await createFlashCookie(request, {
						messageCode: MessageCode.LoginEmailPrefill,
						message: 'We found your account!',
						data: {
							email: user.email,
						},
					}),
				},
			});
		}

		let userSlackResponse: UsersLookupByEmailResponse | undefined;

		try {
			userSlackResponse = await lookUpByEmail(email);
			if (
				!userSlackResponse.ok ||
				!userSlackResponse.user ||
				!userSlackResponse.user.profile
			) {
				return badRequest('We could not find a user with that email address');
			}

			const { profile } = userSlackResponse.user;
			const slackUser: SlackUser = {
				email,
				userYourName: profile.real_name_normalized,
				userPronouns: profile.pronouns,
				userSlackId: userSlackResponse.user.id,
			};

			return redirect('/register/current-member/register', {
				headers: {
					'Set-Cookie': await createFlashCookie(request, {
						messageCode: MessageCode.RegisterSlackUserFound,
						message: 'We found your account!',
						data: {
							slackUser,
						},
					}),
				},
			});
		} catch (error) {
			// @ts-ignore
			if (error?.data?.error === 'users_not_found') {
				return badRequest('We could not find a user with that email address');
			}
			return badRequest('There was an error looking up your email address');
		}

		// throw new Error('Unknown error');
	} catch (error) {
		// Because redirects work by throwing a Response, you need to check if the
		// caught error is a response and return it or throw it again
		if (error instanceof Response) {
			return error;
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
// export let loader = async ({ request }: LoaderArgs) => {
// 	const url = new URL(request.url);
// 	const redirectOnSuccess = url.searchParams.get('redirectOnSuccess');

// 	return await authenticator.isAuthenticated(request, {
// 		successRedirect: redirectOnSuccess || '/membership',
// 	});
// };

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
	const actionData = useActionData<typeof action>() as unknown as
		| { slackUser: SlackUser }
		| { message: string };

	let error: string | undefined;

	if (actionData && 'message' in actionData) {
		error = actionData.message;
	}

	return <CurrentMemberForm error={error} />;
}
