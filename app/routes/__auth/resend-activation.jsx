import { Form, useActionData, useCatch } from '@remix-run/react';
import { json } from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';
import { AuthorizationError } from 'remix-auth';
import { CmsAuth } from '~/api/cmsauth.server';
import { CmsError } from '~/api/util';
import SingleTask from '~/components/layouts/SingleTask';
import Alert from '~/components/app/Alert';
import { Button } from '~/components/app/Button';
import { TextInput } from '~/components/app/Forms';

function ResendActivation({ errorMessage }) {
	return (
		<SingleTask title="Resend Activation">
			<Form method="post" reloadDocument className="space-y-6">
				{errorMessage && (
					<Alert
						title="There was an error resending your activation email."
						type="danger"
					>
						<p>{errorMessage}</p>
					</Alert>
				)}

				<TextInput label="Email Address" type="email" name="email" required />

				<div>
					<Button type="submit" fullWidth>
						Resend Activation
					</Button>
				</div>
			</Form>
		</SingleTask>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	console.log({ caught });

	return (
		<SingleTask title="Resend Activation">
			<Alert
				title="There was an error resending your activation email."
				type="danger"
			>
				<p>Please try again.</p>
			</Alert>
		</SingleTask>
	);
}

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
	const actionData = useActionData();

	if (actionData?.successMessage) {
		return (
			<SingleTask title="Resend Activation">
				<Alert title="Activation Email Sent" type="success">
					{actionData.successMessage}
				</Alert>
			</SingleTask>
		);
	}

	return <ResendActivation errorMessage={actionData?.message} />;
}

export let action = async ({ request }) => {
	try {
		const form = await request.formData();

		const api = new CmsAuth();

		const values = {
			email: form.get('email'),
		};

		// console.log({ values });

		const response = await api.resendActivation(values);

		return json({ successMessage: response.resendActivation });
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
	// If the user is already authenticated redirect to /dashboard directly
	return await authenticator.isAuthenticated(request, {
		successRedirect: '/membership',
	});
};
