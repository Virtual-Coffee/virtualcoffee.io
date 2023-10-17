import { Link, useLoaderData, useCatch } from '@remix-run/react';
import { json, type LoaderArgs, redirect } from '@remix-run/node';
import { CmsAuth } from '~/api/cmsauth.server';
import SingleTask from '~/components/layouts/SingleTask';
import Alert from '~/components/app/Alert';
import type { CmsErrors } from '~/api/util';
import { Button } from '~/components/app/Button';

export { metaFromData as meta } from '~/util/remixHelpers';

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

export let loader = async ({ request }: LoaderArgs) => {
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

	return json({
		response,
		meta: {
			title: 'Account activated.',
			description: ``,
		},
	});
};

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
