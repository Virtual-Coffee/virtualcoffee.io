import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { loadMdxRouteFileAttributes } from '~/util/loadMdx.server';
import DefaultLayout from '~/components/layouts/DefaultLayout';

export async function loader({ request }) {
	const slug = new URL(request.url).pathname;

	const attributes = loadMdxRouteFileAttributes({
		slug: `/__simpleMdx${slug}`,
	});

	return json({
		meta: attributes?.meta,
		hero: attributes?.hero,
	});
}

export default function SimpleLayout() {
	return (
		<DefaultLayout simple>
			<Outlet />
		</DefaultLayout>
	);
}
