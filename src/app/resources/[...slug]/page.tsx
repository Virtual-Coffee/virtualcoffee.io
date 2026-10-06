import { extractRoutes, loadMdxDirectory } from '@/util/loadMdx.server';
import { ResourcePage, resourceMetadata } from '../resourcePage';

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
	const allFiles = await loadMdxDirectory({
		baseDirectory: 'content/resources',
	});

	return extractRoutes(allFiles, 'content/resources/')
		.filter(Boolean)
		.map((slug) => ({ slug: slug.split('/') }));
}

export async function generateMetadata({
	params,
}: PageProps<'/resources/[...slug]'>) {
	return resourceMetadata((await params).slug.join('/'));
}

export default async function Page({
	params,
}: PageProps<'/resources/[...slug]'>) {
	return <ResourcePage uri={(await params).slug.join('/')} />;
}
