import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';
import {
	loadMdxDirectory,
	loadMdxRouteFileAttributes,
	MdxFile,
} from '@/util/loadMdx.server';
import type { NextPageProps } from '@/util/types';
import { MDXProps } from 'mdx/types';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// export function generateStaticParams() {
// 	return [{ slug: [''] }, { slug: ['products'] }];
// }

export const dynamicParams = true;

function getFile(slug: string) {
	const file = loadMdxRouteFileAttributes({
		slug: `content/resources/${slug}`,
	});
	if (file) {
		const {
			default: Component,
		}: {
			default: React.ComponentType<MDXProps>;
		} = slug
			? require(
					`@/content/resources/${slug}${file.isIndex ? '/index' : ''}.mdx`,
				)
			: require('@/content/resources/index.mdx');
		return { ...file, Component };
	} else {
		return null;
	}
}

function trimString(s: string, c: string) {
	if (c === ']') c = '\\]';
	if (c === '^') c = '\\^';
	if (c === '\\') c = '\\\\';
	return s.replace(new RegExp('^[' + c + ']+|[' + c + ']+$', 'g'), '');
}

function findBreadcrumbs(files: MdxFile[], slug: string): MdxFile[] {
	return files
		.reduce((list, file) => {
			console.log(slug, file.slug.replace('content/', ''));

			if (
				trimString(file.slug.replace('content/', ''), '/') ===
				trimString(slug, '/')
			) {
				return [...list, file];
			}

			if (file.children) {
				const childrenResult = findBreadcrumbs(file.children, slug);
				if (childrenResult.length) {
					return [...list, file, ...childrenResult];
				}
			}

			return list;
		}, [] as MdxFile[])
		.flat()
		.filter(Boolean);
}

export async function generateMetadata({
	params,
	searchParams,
}: NextPageProps<'slug', false, true>): Promise<Metadata> {
	const uri = (params.slug ?? []).join('/');

	const file = getFile(uri);
	if (!file) {
		notFound();
	}

	return createMetaData({
		title: file.meta.title,
		description: file.meta.description,
		Hero: file.hero?.Hero,
	});
}

export default function Page({
	params,
	searchParams,
}: NextPageProps<'slug', false, true>) {
	const uri = (params.slug ?? []).join('/');
	const file = getFile(uri);

	if (!file) {
		notFound();
	}

	const allFiles = loadMdxDirectory({ baseDirectory: 'content/resources' });
	const breadCrumbs = findBreadcrumbs(allFiles, 'resources/' + uri);

	return (
		<DefaultLayout
			Hero={file.hero?.Hero}
			heroHeader={file.hero?.heroHeader || file.meta.title}
			heroSubheader={file.hero?.heroSubheader || file.meta.description}
		>
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
											<Link href={`/${bc.slug.replace('content/', '')}`}>
												{bc.meta.title}
											</Link>
										</li>
									);
								})}
							</ol>
						</nav>
					</div>
				</div>

				<file.Component />
			</div>
		</DefaultLayout>
	);
}
