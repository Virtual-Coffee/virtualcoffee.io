import { Outlet } from 'remix';

import DefaultLayout from '~/components/layouts/DefaultLayout';

export default function SimpleLayout() {
	return (
		<DefaultLayout simple>
			<Outlet />
		</DefaultLayout>
	);
}
