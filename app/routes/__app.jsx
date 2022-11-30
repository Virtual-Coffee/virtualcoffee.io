import { Outlet, useLoaderData, useMatches } from '@remix-run/react';
import AppRoot from '~/components/layouts/AppRoot';
import styles from '~/tailwind.css';
import { json } from '@remix-run/node';
import { getUser } from '~/auth/auth.server';

export const loader = async ({ request }) => {
	const user = await getUser(request);

	return json({ user });
};

export const links = () => [
	{ rel: 'preconnect', href: 'https://rsms.me/' },
	{ rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
	{ rel: 'stylesheet', href: styles },
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
