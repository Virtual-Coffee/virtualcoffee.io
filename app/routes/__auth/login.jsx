import {
	Form,
	useActionData,
	useCatch,
	Link,
	useLoaderData,
} from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { authenticator, getUser } from '~/auth/auth.server';
import { AuthorizationError } from 'remix-auth';
import VirtualCoffeeFullBanner from '~/svg/VirtualCoffeeFullBanner';
import Alert from '~/components/app/Alert';

function LogInForm({ error, redirectOnSuccess }) {
	return (
		<>
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<VirtualCoffeeFullBanner
					className="mx-auto h-12 w-auto"
					title="Virtual Coffee"
				/>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Sign in to your account
				</h2>
			</div>
			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<Form
						className="space-y-6"
						method="post"
						reloadDocument
						action={`/login${
							redirectOnSuccess ? '?redirectOnSuccess=' + redirectOnSuccess : ''
						}`}
					>
						{error && (
							<Alert title="There was an error signing you in." type="danger">
								<p>{error}</p>
								{error === 'Please activate your account before logging in' && (
									<p>
										<Link to="/resend-activation">Resend Activation Email</Link>
									</p>
								)}
							</Alert>
						)}
						{redirectOnSuccess && (
							<Alert type="info" title="Please log in to see this content." />
						)}

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email address
							</label>
							<div className="mt-1">
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<div className="mt-1">
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									required
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
								/>
							</div>
						</div>

						<div className="flex items-center justify-end">
							{/* <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div> */}

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
							<button
								type="submit"
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
							>
								Sign in
							</button>
						</div>
					</Form>
				</div>
			</div>
		</>
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
	const { redirectOnSuccess } = useLoaderData();
	const actionData = useActionData();
	console.log({ t: actionData });

	return (
		<LogInForm
			error={actionData?.message}
			redirectOnSuccess={redirectOnSuccess}
		/>
	);
}

export let action = async ({ request }) => {
	// we call the method with the name of the strategy we want to use and the
	// request object, optionally we pass an object with the URLs we want the user
	// to be redirected to after a success or a failure

	const url = new URL(request.url);
	const redirectOnSuccess = url.searchParams.get('redirectOnSuccess');

	try {
		return await authenticator.authenticate('user-pass', request, {
			successRedirect: redirectOnSuccess || '/membership',
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
		console.log(error);
		return json({ message: 'There was a server error.' });
	}
};

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
export let loader = async ({ request }) => {
	// If the user is already authenticated redirect to /dashboard directly
	const user = await getUser(request);

	if (user) {
		return redirect('/membership');
	}

	const url = new URL(request.url);
	const redirectOnSuccess = url.searchParams.get('redirectOnSuccess');

	return json({
		redirectOnSuccess,
	});
};
