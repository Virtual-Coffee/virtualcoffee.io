import { json, Outlet, useLoaderData } from 'remix';
import {
	loadMdxDirectory,
	loadMdxRouteFileAttributes,
} from '~/util/loadMdx.server';
import DefaultLayout from '~/components/layouts/DefaultLayout';

export async function loader({ request }) {
	const slug = new URL(request.url).pathname;
	const attributes = loadMdxRouteFileAttributes({ slug });

	const allFiles = loadMdxDirectory({ baseDirectory: 'resources' });

	// console.log(allFiles);

	return json({
		allFiles,
		meta: attributes.meta,
		hero: attributes.hero,
	});
}

export default function ResourcesTemplate() {
	const { allFiles } = useLoaderData();

	// console.log('running', { Hero, heroHeader, heroSubheader });

	return (
		<DefaultLayout>
			<div className="resources-section">
				<Outlet context={allFiles} />
			</div>
		</DefaultLayout>
	);
}
