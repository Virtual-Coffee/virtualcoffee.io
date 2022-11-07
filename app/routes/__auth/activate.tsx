import { Link, useLoaderData, useCatch } from '@remix-run/react';
import { json, LoaderArgs, redirect } from '@remix-run/node';
import { CmsAuth } from '~/api/cmsauth.server';
import SingleTask from '~/components/layouts/SingleTask';
import Alert from '~/components/app/Alert';
import type { CmsErrors } from '~/api/util';
import { Button } from '~/components/app/Button';

export function CatchBoundary() {
	const caught = useCatch();

	console.log({ caught });

	return (
		<SingleTask title="Activate Account">
			<Alert title="There was an error activating your account." type="danger">
				<p>Please try again.</p>
			</Alert>
		</SingleTask>
	);
}

export function ErrorBoundary({ error }: { error: CmsErrors }) {
	return (
		<SingleTask title="Activate Account">
			<Alert title="There was an error activating your account:" type="danger">
				{error.message || 'Server error.'}
			</Alert>
		</SingleTask>
	);
}

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate method`
export let loader = async ({ request }: LoaderArgs) => {
	// we call the method with the name of the strategy we want to use and the
	// request object, optionally we pass an object with the URLs we want the user
	// to be redirected to after a success or a failure
	// try {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	const id = url.searchParams.get('id');

	if (!code || !id) {
		return redirect('/login');
	}

	const api = new CmsAuth();

	// console.log({ values });

	const response = await api.activateUser({ code, id });
	console.log({ response });

	return json(response);
};

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
	const loaderData = useLoaderData<typeof loader>();
	console.log({ loaderData });

	return (
		<SingleTask title="Activate Account">
			<Alert type="success" title="Account Activated!">
				<div className="flex justify-end">
					<Button as={Link} to="/login">
						Log In
					</Button>
				</div>
			</Alert>
		</SingleTask>
	);
}
