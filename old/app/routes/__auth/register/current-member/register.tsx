import {
	Form,
	useActionData,
	useCatch,
	useLoaderData,
	useTransition,
} from '@remix-run/react';
import {
	type ActionArgs,
	json,
	type LoaderArgs,
	redirect,
} from '@remix-run/node';
import { CmsAuth } from '~/api/cmsauth.server';
import { CmsError } from '~/api/util';
import SingleTask from '~/components/layouts/SingleTask';
import Alert from '~/components/app/Alert';
import { Button } from '~/components/app/Button';
import { TextInput, FieldSet } from '~/components/app/Forms';

import { MessageCode, type SlackUser } from '~/auth/types';
import { readFlashCookie } from '~/auth/session.server';
import type { RegisterExistingUserActionData } from '~/api/types';
export { metaFromData as meta } from '~/util/remixHelpers';

export const RegisterForm = ({
	initialValues,
	fieldErrors,
	formError,
	slackUser,
}: {
	initialValues?: RegisterExistingUserActionData['fields'];
	fieldErrors?: RegisterExistingUserActionData['fieldErrors'];
	formError?: RegisterExistingUserActionData['formError'];
	slackUser: SlackUser;
}) => {
	const transition = useTransition();
	const isCreating = Boolean(transition.submission);

	const combinedInitialValues = {
		...slackUser,
		...(initialValues || {}),
	};

	return (
		<SingleTask title="Confirm your details" wide>
			<Form method="post" reloadDocument className="space-y-6">
				{formError && (
					<Alert title="Form Error" type="danger">
						{formError}
					</Alert>
				)}

				<input type="hidden" name="userSlackId" value={slackUser.userSlackId} />
				<FieldSet legend="Confirm your Info">
					<TextInput
						label="Email"
						id="email"
						help="Required. We'll never share your email with anyone else."
						type="email"
						autoComplete="email"
						required
						defaultValue={combinedInitialValues?.email}
						errorMessage={fieldErrors?.email}
					/>

					<TextInput
						label="Your Name"
						id="userYourName"
						help="Required."
						type="text"
						required
						defaultValue={combinedInitialValues?.userYourName}
						errorMessage={fieldErrors?.userYourName}
					/>

					<TextInput
						label="Your Pronouns"
						id="userPronouns"
						type="text"
						defaultValue={combinedInitialValues?.userPronouns || undefined}
						errorMessage={fieldErrors?.userPronouns}
					/>

					<TextInput
						label="Set a Password"
						id="password"
						type="password"
						autoComplete="current-password"
						required
						defaultValue={combinedInitialValues?.password}
						errorMessage={fieldErrors?.password}
					/>
				</FieldSet>

				<div className="prose prose-lg">
					<p>
						Please take a moment to read our{' '}
						<a
							href="/code-of-conduct"
							target="_blank"
							rel="noopener noreferrer"
						>
							Code of Conduct
						</a>
						.
					</p>
				</div>

				<div className="relative flex items-start">
					<div className="flex h-5 items-center">
						<input
							required
							id="agree"
							name="agree"
							type="checkbox"
							className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
						/>
					</div>
					<div className="ml-3 text-sm">
						<label htmlFor="agree" className="font-medium text-gray-700">
							I've read the Code of Conduct and understand my responsibilities
							as a member of the Virtual Coffee community
						</label>
					</div>
				</div>

				<div className="text-right">
					<Button size="lg" type="submit" disabled={isCreating}>
						{isCreating ? 'Saving...' : 'Submit'}
					</Button>
				</div>
			</Form>
		</SingleTask>
	);
};

export function CatchBoundary() {
	const caught = useCatch();

	console.log({ caught });

	return <div>Unknown error.</div>;
}

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
	const { slackUser } = useLoaderData<typeof loader>() as unknown as {
		slackUser: SlackUser | null;
	};

	const actionData =
		useActionData() as unknown as RegisterExistingUserActionData;
	const initialValues = actionData?.fields;

	if (!slackUser) {
		return <div>Unknown error.</div>;
	}

	return (
		<RegisterForm
			slackUser={slackUser}
			initialValues={initialValues}
			fieldErrors={actionData?.fieldErrors}
			formError={actionData?.formError}
		/>
	);
}

const badRequest = (data: RegisterExistingUserActionData) =>
	json(data, { status: 400 });

export let action = async ({ request }: ActionArgs) => {
	try {
		const form = await request.formData();

		const api = new CmsAuth();

		const email = form.get('email');
		const password = form.get('password');
		const userYourName = form.get('userYourName');
		const userPronouns = form.get('userPronouns');
		const userSlackId = form.get('userSlackId');

		if (
			typeof email !== 'string' ||
			typeof password !== 'string' ||
			typeof userYourName !== 'string' ||
			(userPronouns && typeof userPronouns !== 'string') ||
			typeof userSlackId !== 'string'
		) {
			return badRequest({
				formError: `Form not submitted correctly.`,
			});
		}

		const fieldErrors = {
			email: email ? undefined : 'Email is required',
			password: password ? undefined : 'Password is required',
			userYourName: userYourName ? undefined : 'Name is required',
			userSlackId: userSlackId ? undefined : 'Slack ID is required',
		};

		const fields = {
			email,
			password,
			userYourName,
			userPronouns,
			userSlackId,
		};

		if (Object.values(fieldErrors).some(Boolean)) {
			return badRequest({ fieldErrors, fields });
		}

		// console.log({ values });

		await api.registerExistingUser(fields);

		return redirect(`/register/current-member/register-success`);
	} catch (error) {
		// Because redirects work by throwing a Response, you need to check if the
		// caught error is a response and return it or throw it again
		if (error instanceof CmsError) {
			console.log('is CmsError', error);
			return json({
				message: error.message,
				errors: error.data,
			});
		}

		// here the error is a generic error that another reason may throw
		console.log('is generic error', error);
		return json({
			message: 'There was a server error.',
		});
	}
};

export let loader = async ({ request }: LoaderArgs) => {
	const sessionFlashCheck = await readFlashCookie(request);

	if (sessionFlashCheck) {
		if (
			sessionFlashCheck.sessionFlash &&
			sessionFlashCheck.sessionFlash.messageCode ===
				MessageCode.RegisterSlackUserFound
		) {
			return json(
				{
					slackUser: sessionFlashCheck.sessionFlash.data.slackUser,
					meta: {
						title: 'Confirm your details',
						description: ``,
					},
				},
				{
					headers: {
						// only necessary with cookieSessionStorage
						'Set-Cookie': sessionFlashCheck.cookie,
					},
				},
			);
		} else {
			return redirect('/register/current-member', {
				headers: {
					// only necessary with cookieSessionStorage
					'Set-Cookie': sessionFlashCheck.cookie,
				},
			});
		}
	}
	return redirect('/register/current-member');
};
