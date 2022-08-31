import { json } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { authenticate } from '~/auth/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
	await authenticate(request);
	return null;
};

export default function Page() {
	return <div>Dashboard</div>;
}
