import { json } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useMatches } from '@remix-run/react';
import {
	loadMdxDirectory,
	loadMdxRouteFileAttributes,
} from '~/util/loadMdx.server';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import createSocialImage from '../util/socialimage';

function trimString(s, c) {
	if (c === ']') c = '\\]';
	if (c === '^') c = '\\^';
	if (c === '\\') c = '\\\\';
	return s.replace(new RegExp('^[' + c + ']+|[' + c + ']+$', 'g'), '');
}

function findBreadcrumbs(files, slug) {
	return files
		.reduce((list, file) => {
			if (trimString(file.slug, '/') === trimString(slug, '/')) {
				return [...list, file];
			}

			if (file.children) {
				const childrenResult = findBreadcrumbs(file.children, slug);
				if (childrenResult.length) {
					return [...list, file, ...childrenResult];
				}
			}

			return list;
		}, [])
		.flat()
		.filter(Boolean);
}

function findCurrentFile(files, pathname) {
	const trimmedPathname = trimString(pathname, '/');

	let foundFile;

	for (let i = 0; i < files.length; i++) {
		if (!foundFile) {
			const file = files[i];

			if (trimString(file.slug, '/') === trimmedPathname) {
				foundFile = file;
			} else if (file.children) {
				foundFile = findCurrentFile(file.children, pathname);
			}
		}
	}

	return foundFile;
}

export async function loader({ request }) {
	const slug = new URL(request.url).pathname;
	const attributes = loadMdxRouteFileAttributes({ slug });

	const allFiles = loadMdxDirectory({ baseDirectory: 'resources' });

	return json({
		allFiles,
		meta: attributes.meta,
		hero: attributes.hero,
	});
}

export function meta({ data }) {
	try {
		console.log(
			createSocialImage({
				title: data.meta.title,
				subtitle: data.meta.description,
			}),
		);
		return {
			'og:image': createSocialImage({
				title: data.meta.title,
				subtitle: data.meta.description,
			}),
			'twitter:image': createSocialImage({
				title: data.meta.title,
				subtitle: data.meta.description,
			}),
		};
	} catch (error) {
		console.log(error);
		return {};
	}
}

export default function ResourcesTemplate() {
	const { allFiles, meta, hero } = useLoaderData();
	const location = useLocation();
	const currentFile = findCurrentFile(allFiles, location.pathname);
	const layoutProps = useMemo(() => {
		return {
			Hero: currentFile?.hero?.Hero,
			heroHeader: currentFile?.hero?.heroHeader || currentFile?.meta?.title,
			heroSubheader:
				currentFile?.hero?.heroSubheader || currentFile?.meta?.description,
		};
	}, [location.pathname, allFiles]);

	const breadCrumbs = useMemo(() => {
		return findBreadcrumbs(allFiles, location.pathname);
	}, [location.pathname, allFiles]);

	return (
		<DefaultLayout {...layoutProps}>
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
