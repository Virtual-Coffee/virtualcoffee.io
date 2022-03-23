import { Outlet, useMatches } from 'remix';

import DefaultLayout from '~/components/layouts/DefaultLayout';

// export async function loader({ request }) {

// }

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
