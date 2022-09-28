import { Outlet } from '@remix-run/react';
import styles from '~/tailwind.css';

export const links = () => [
	{ rel: 'stylesheet', href: styles },
	{ rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
];

export default function SimpleLayout() {
	return (
		<div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<Outlet />
		</div>
	);
}
