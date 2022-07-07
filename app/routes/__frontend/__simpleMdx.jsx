import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { loadMdxRouteFileAttributes } from '~/util/loadMdx.server';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import { createMetaData } from '~/util/createMetaData.server';

export async function loader({ request }) {
	const slug = new URL(request.url).pathname;

	const attributes = loadMdxRouteFileAttributes({
		slug: `/__simpleMdx${slug}`,
	});

	return json({
		meta: attributes?.meta
			? {
					...attributes.meta,
					...createMetaData({
						...attributes.meta,
						Hero: attributes?.hero?.Hero,
					}),
			  }
			: undefined,
		hero: attributes?.hero,
	});
}

export function meta({ data: { meta } = {} } = {}) {
	return meta;
}

export default function SimpleLayout() {
	return (
		<DefaultLayout simple>
			<Outlet />
		</DefaultLayout>
	);
}
