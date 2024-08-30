import {
	Form,
	useActionData,
	useCatch,
	useLoaderData,
	Link,
} from '@remix-run/react';
import { json } from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';
import { CmsAuth } from '~/api/cmsauth.server';
import { CmsError } from '~/api/util';
import { redirect } from '@remix-run/node';
import SingleTask from '~/components/layouts/SingleTask';
import Alert from '~/components/app/Alert';
import { Button } from '~/components/app/Button';
import { TextInput } from '~/components/app/Forms';

export function CatchBoundary() {
	const caught = useCatch();

	console.log({ caught });

	return (
		<SingleTask title="Set Password">
			<Alert title="There was an error resetting your password." type="danger">
				<p>Please try again.</p>
			</Alert>
		</SingleTask>
	);
}

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
	const { id, code } = useLoaderData();
	const actionData = useActionData();

	if (actionData?.successMessage) {
		return (
			<SingleTask title="Set Password">
				<Alert type="success" title="Password Set!">
					<p>{actionData.successMessage}</p>
					<p>
						<Button as={Link} to="/login">
							Log In
						</Button>
					</p>
				</Alert>
			</SingleTask>
		);
	}

	return (
		<SingleTask title="Set Password">
			<Form
				action={`/set-password?id=${id}&code=${code}`}
				method="post"
				reloadDocument
				className="space-y-6"
			>
				{actionData?.message && (
					<Alert
						title="There was an error resetting your password."
						type="danger"
					>
						<p>{actionData?.message}</p>
					</Alert>
				)}
				<TextInput
					label="New Password"
					type="password"
					name="password"
					required
				/>
				<div>
					<Button type="submit">Set Password</Button>
				</div>
			</Form>
		</SingleTask>
	);
}

export let action = async ({ request }) => {
	try {
		const form = await request.formData();

		const url = new URL(request.url);
		const code = url.searchParams.get('code');
		const id = url.searchParams.get('id');

		if (!code || !id) {
			return redirect('/login');
		}

		const api = new CmsAuth();

		const values = {
			password: form.get('password'),
			code,
			id,
		};

		// console.log({ values });

		const response = await api.setPassword(values);

		return json({ successMessage: response.setPassword });
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

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
export let loader = async ({ request }) => {
	await authenticator.isAuthenticated(request, {
		successRedirect: '/membership',
	});

	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	const id = url.searchParams.get('id');

	return json({ code, id });
};
