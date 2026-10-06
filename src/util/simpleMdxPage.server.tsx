import 'server-only';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';
import { loadMdxRouteFileAttributes } from '@/util/loadMdx.server';
import type { MDXProps } from 'mdx/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/** The files in `src/content/simple-mdx-pages`, each served by its own route. */
type SimpleMdxSlug = 'about' | 'code-of-conduct' | 'uses';

async function getFile(slug: SimpleMdxSlug) {
	const file = await loadMdxRouteFileAttributes({
		slug: `content/simple-mdx-pages/${slug}`,
	});
	if (!file) notFound();
	const {
		default: Component,
	}: {
		default: React.ComponentType<MDXProps>;
	} = await import(`@/content/simple-mdx-pages/${slug}.mdx`);
	return { ...file, Component };
}

export async function simpleMdxMetadata(
	slug: SimpleMdxSlug,
): Promise<Metadata> {
	const file = await getFile(slug);
	return await createMetaData({
		title: file.meta.title,
		description: file.meta.description,
		Hero: file.hero?.Hero,
	});
}

export async function SimpleMdxPage({ slug }: { slug: SimpleMdxSlug }) {
	const file = await getFile(slug);
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
