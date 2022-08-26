import { Outlet, useLoaderData, useMatches } from '@remix-run/react';
import AppRoot from '~/components/layouts/AppRoot';
import { authenticate } from '~/auth/auth.server';
import styles from '~/tailwind.css';
import { json } from '@remix-run/node';

export const loader = async ({ request }) => {
	let user = await authenticate(request);
	if (user) {
		// console.log({ user: user?.authenticate?.user });
		return json({ user: user.user });
	}

	return json({});
};

export const links = () => [
	{ rel: 'stylesheet', href: styles },
	{ rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
];

export default function App() {
	const matches = useMatches();

	const metaTitle = matches.reverse().find((match) => !!match.data?.meta)?.data
		.meta.title;

	const title = metaTitle ? `${metaTitle} - VC Member Center` : '';

	const { user } = useLoaderData();
	return (
		<AppRoot user={user} title={title}>
			<Outlet />
		</AppRoot>
	);
}