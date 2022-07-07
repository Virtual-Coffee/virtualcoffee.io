import { Outlet } from '@remix-run/react';
import AppRoot from '~/components/AppRoot';

export default function App() {
	return (
		<AppRoot>
			<Outlet />
		</AppRoot>
	);
}
