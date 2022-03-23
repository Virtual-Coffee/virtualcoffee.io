import { json, Outlet, useLoaderData, useMatches } from 'remix';

import DefaultLayout from '~/components/layouts/DefaultLayout';
import NewsletterSubscribe from '../components/NewslettterSubscribe';

// export async function loader({ request }) {

// }

export default function ResourcesTemplate() {
	const routeId = useMatches().slice(-1)[0].id;

	// const { allFiles, Hero, heroHeader, heroSubheader } = useLoaderData();

	// console.log('running', { Hero, heroHeader, heroSubheader });

	return (
		<DefaultLayout simple={true}>
			<Outlet />
			{routeId !== 'routes/newsletter/index' && (
				<>
					<hr />
					<NewsletterSubscribe />
				</>
			)}
		</DefaultLayout>
	);
}
