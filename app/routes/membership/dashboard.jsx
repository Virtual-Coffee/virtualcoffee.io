import { json } from '@remix-run/node';
import { Link } from 'react-router-dom';
import { authenticator } from '~/auth/auth.server';

export async function loader({ request }) {
	let user = await authenticator.isAuthenticated(request);
	if (user) {
		console.log({ user: user?.authenticate?.user });
	} else {
		console.log('no user');
	}

	return json({ x: 1 });
}

export default function Page() {
	return (
		<div>
			<div>
				<form action="/auth/logout" method="POST">
					<button type="submit">Log Out</button>
				</form>
			</div>
		</div>
	);
}
