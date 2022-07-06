import { json } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { authenticate } from '~/auth/auth.server';

export async function loader({ request }) {
	let user = await authenticate(request);
	if (user) {
		// console.log({ user: user?.authenticate?.user });
		console.log({ user });
	} else {
		console.log('no user');
	}

	return json({ x: 1 });
}

export default function Page() {
	return (
		<div>
			<Link to="/auth/logout">Log Out</Link>
		</div>
	);
}
