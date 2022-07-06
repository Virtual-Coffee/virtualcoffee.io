import { Form, useActionData, useCatch, Link } from '@remix-run/react';
import { json } from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';
import { AuthorizationError } from 'remix-auth';

function LogInForm({ error }) {
	return (
		<Form method="post" reloadDocument>
			<legend>Log In</legend>
			{error && (
				<div className="alert alert-danger">
					<p>{error}</p>
					{error === 'Please activate your account before logging in' && (
						<p>
							<Link to="/auth/resend-activation">Resend Activation Email</Link>
						</p>
					)}
				</div>
			)}
			<input type="email" name="email" required />
			<input
				type="password"
				name="password"
				autoComplete="current-password"
				required
			/>
			<button>Log In</button>
		</Form>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	console.log({ caught });

	return <LogInForm error={caught.data} />;
}

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
	const actionData = useActionData();
	console.log({ t: actionData });

	return <LogInForm error={actionData?.message} />;
}

export let action = async ({ request }) => {
	// we call the method with the name of the strategy we want to use and the
	// request object, optionally we pass an object with the URLs we want the user
	// to be redirected to after a success or a failure

	try {
		return await authenticator.authenticate('user-pass', request, {
			successRedirect: '/membership/dashboard',
		});
	} catch (error) {
		// Because redirects work by throwing a Response, you need to check if the
		// caught error is a response and return it or throw it again
		if (error instanceof Response) {
			return error;
		}
		if (error instanceof AuthorizationError) {
			console.log('is auth error');
			console.log(error);
			console.log({
				message: error.message,
				data: error.data,
			});
			return json({ message: error.message });
			// here the error is related to the authentication process
		}
		// here the error is a generic error that another reason may throw
		console.log('is generic error');
		return json({ message: 'There was a server error.' });
	}
};

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
export let loader = async ({ request }) => {
	// If the user is already authenticated redirect to /dashboard directly
	return await authenticator.isAuthenticated(request, {
		successRedirect: '/membership/dashboard',
	});
};
