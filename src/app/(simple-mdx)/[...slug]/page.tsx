import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';
import {
	loadMdxRouteFileAttributes,
	loadMdxDirectory,
} from '@/util/loadMdx.server';
import type { NextPageProps } from '@/util/types';
import { MDXProps } from 'mdx/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
	const allFiles = loadMdxDirectory({
		baseDirectory: 'content/simple-mdx-pages',
	});

	return allFiles.map((s) => ({
		slug: [s.slug.replace('content/simple-mdx-pages/', '')],
	}));
}

export const dynamicParams = true;

function getFile(slug: string) {
	const file = loadMdxRouteFileAttributes({
		slug: `content/simple-mdx-pages/${slug}`,
	});
	if (file) {
		const {
			default: Component,
		}: {
			default: React.ComponentType<MDXProps>;
		} = require(`@/content/simple-mdx-pages/${slug}.mdx`);
		return { ...file, Component };
	} else {
		return null;
	}
}

export async function generateMetadata({
	params,
}: NextPageProps<'slug', false, true>): Promise<Metadata> {
	const uri = ((await params).slug ?? []).join('/');

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

export default async function Page({
	params,
}: NextPageProps<'slug', false, true>) {
	const uri = ((await params).slug ?? []).join('/');
	const file = getFile(uri);

	if (!file) {
		notFound();
	}

	return (
		<DefaultLayout
			Hero={file.hero?.Hero}
			heroHeader={file.hero?.heroHeader || file.meta.title}
			heroSubheader={file.hero?.heroSubheader || file.meta.description}
			simple
		>
			{' '}
			<file.Component />
		</DefaultLayout>
	);
}
