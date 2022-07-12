import { json } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/auth/auth.server';
import { CmsActions } from '~/api/cms.server';

export const loader: LoaderFunction = async ({ request }) => {
	await authenticate(request);

	let api = new CmsActions();
	await api.authenticate(request);

	const calendars = await api.getCalendars();

	return json({ calendars });
};

export default function Page() {
	const { calendars } = useLoaderData();
	console.log({ calendars });
	return <div>Dashboard</div>;
}
