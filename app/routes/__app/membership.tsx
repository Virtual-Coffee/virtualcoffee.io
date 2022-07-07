import { json } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { authenticate } from '~/auth/auth.server';
import { Outlet } from '@remix-run/react';
import DefaultLayout from '~/components/layouts/DefaultLayout';

export const loader: LoaderFunction = async ({ request }) => {
	let user = await authenticate(request);
	if (user) {
		// console.log({ user: user?.authenticate?.user });
		console.log({ user });
	} else {
		console.log('no user');
	}

	return json({ x: 1 });
};

export default function Page() {
	return <Outlet />;
}
