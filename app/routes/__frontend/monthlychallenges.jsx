import { Outlet, useMatches } from '@remix-run/react';
import DefaultLayout from '~/components/layouts/DefaultLayout';

export default function ChallengesLayout() {
	const routeId = useMatches().slice(-1)[0].id;

	// const { allFiles, Hero, heroHeader, heroSubheader } = useLoaderData();

	// console.log('running', { Hero, heroHeader, heroSubheader });

	return (
		<DefaultLayout simple={routeId !== 'routes/monthlychallenges/index'}>
			<Outlet />
		</DefaultLayout>
	);
}
