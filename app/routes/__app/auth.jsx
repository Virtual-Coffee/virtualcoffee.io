import { Outlet } from '@remix-run/react';
import DefaultLayout from '~/components/layouts/DefaultLayout';

export default function SimpleLayout() {
	return (
		<DefaultLayout simple showHero={false}>
			<Outlet />
		</DefaultLayout>
	);
}
