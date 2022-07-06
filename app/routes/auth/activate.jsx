import { Form, Link, useLoaderData, useCatch } from '@remix-run/react';
import {
	ActionFunction,
	json,
	LoaderFunction,
	redirect,
} from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';
import { sessionStorage } from '~/auth/session.server';
import { AuthorizationError } from 'remix-auth';
import Api, { CmsError } from '~/api/cms.server';

export function CatchBoundary() {
	const caught = useCatch();

	console.log({ caught });

	return <div>Some error</div>;
}
export function ErrorBoundary({ error }) {
	return (
		<div className="py-5">
			<div className="container">
				<div className="bodycopy">
					<div className="alert alert-danger">
						<div>
							<strong>There was an error activating your account:</strong>
						</div>
						<div>{error.message || 'Server error.'}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
	const loaderData = useLoaderData();
	console.log({ loaderData });

	return (
		<div>
			<div>Thank you, you are now activated!</div>
			<div>
				<Link to="/auth/login">Log In</Link>
			</div>
		</div>
	);
}

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate method`
export let loader = async ({ request }) => {
	// we call the method with the name of the strategy we want to use and the
	// request object, optionally we pass an object with the URLs we want the user
	// to be redirected to after a success or a failure
	// try {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	const id = url.searchParams.get('id');

	if (!code || !id) {
		return redirect('/auth/login');
	}

	const api = new Api();

	// console.log({ values });

	const response = await api.activateUser({ code, id });
	console.log({ response });

	return json(response);
	// } catch (error) {
	// 	// Because redirects work by throwing a Response, you need to check if the
	// 	// caught error is a response and return it or throw it again
	// 	if (error instanceof CmsError) {
	// 		console.log('is CmsError', error);
	// 		return json({
	// 			message: error.message,
	// 			errors: error.data,
	// 		});
	// 	}

	// 	// here the error is a generic error that another reason may throw
	// 	console.log('is generic error', error);
	// 	return json({
	// 		message: 'There was a server error.',
	// 	});
	// }
};
