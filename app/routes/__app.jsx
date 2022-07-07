import { Outlet } from '@remix-run/react';
import AppRoot from '~/components/AppRoot';
import styles from '~/tailwind.css';

export const links = () => [{ rel: 'stylesheet', href: styles }];
export default function App() {
	return (
		<AppRoot>
			<Outlet />
		</AppRoot>
	);
}
