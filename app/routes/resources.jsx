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
		title: attributes.meta.title,
		description: attributes.meta.description,
		Hero: attributes.Hero,
		heroHeader: attributes.heroHeader || attributes.meta.title,
		heroSubheader: attributes.heroSubheader || attributes.meta.description,
	});
}

export default function ResourcesTemplate() {
	const { allFiles, Hero, heroHeader, heroSubheader } = useLoaderData();

	// console.log('running', { Hero, heroHeader, heroSubheader });

	return (
		<DefaultLayout {...{ Hero, heroHeader, heroSubheader }}>
			<div className="resources-section">
				<Outlet context={allFiles} />
			</div>
		</DefaultLayout>
	);
}
