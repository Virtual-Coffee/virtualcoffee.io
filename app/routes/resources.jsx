import { json, Outlet, useLoaderData, useMatches, Link } from 'remix';
import {
	loadMdxDirectory,
	loadMdxRouteFileAttributes,
} from '~/util/loadMdx.server';
import DefaultLayout from '~/components/layouts/DefaultLayout';

function trimString(s, c) {
	if (c === ']') c = '\\]';
	if (c === '^') c = '\\^';
	if (c === '\\') c = '\\\\';
	return s.replace(new RegExp('^[' + c + ']+|[' + c + ']+$', 'g'), '');
}

function findBreadcrumbs(slug, files) {
	return files
		.reduce((list, file) => {
			if (trimString(file.slug, '/') === trimString(slug, '/')) {
				return [...list, file];
			}

			if (file.children) {
				const childrenResult = findBreadcrumbs(slug, file.children);
				if (childrenResult.length) {
					return [...list, file, ...childrenResult];
				}
			}

			return list;
		}, [])
		.flat()
		.filter(Boolean);
}

export async function loader({ request }) {
	const slug = new URL(request.url).pathname;
	const attributes = loadMdxRouteFileAttributes({ slug });

	const allFiles = loadMdxDirectory({ baseDirectory: 'resources' });

	// console.log(allFiles);
	const breadCrumbs = findBreadcrumbs(slug, allFiles);

	return json({
		allFiles,
		meta: attributes.meta,
		hero: attributes.hero,
		breadCrumbs,
	});
}

export default function ResourcesTemplate() {
	const { allFiles, breadCrumbs } = useLoaderData();

	const matches = useMatches();
	// console.log(matches);

	return (
		<DefaultLayout>
			<div className="resources-section">
				<div className="py-4">
					<div className="container">
						<nav aria-label="breadcrumb">
							<ol className="breadcrumb">
								<li className="breadcrumb-item">
									<a href="/resources">Resources</a>
								</li>

								{breadCrumbs.map((bc, i) => {
									if (i === breadCrumbs.length - 1) {
										return (
											<li
												key={bc.slug}
												className="breadcrumb-item active"
												aria-current="page"
											>
												{bc.meta.title}
											</li>
										);
									}
									return (
										<li className="breadcrumb-item" key={bc.slug}>
											<Link to={`/${bc.slug}`}>{bc.meta.title}</Link>
										</li>
									);
								})}
							</ol>
						</nav>
					</div>
				</div>
				<Outlet context={allFiles} />
			</div>
		</DefaultLayout>
	);
}
