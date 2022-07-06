import { json } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { authenticate } from '~/auth/auth.server';

export async function loader({ request }) {
	let user = await authenticate(request);

	return null;
}

export default function Screen() {
	return <div>yo</div>;
}
