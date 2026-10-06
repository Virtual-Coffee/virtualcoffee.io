import DefaultLayout from '@/components/layouts/DefaultLayout';
import { getChallenge, getChallenges } from '@/data/monthlyChallenges';
import { createMetaData } from '@/util/createMetaData.server';
import { MDXProps } from 'mdx/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export const dynamic = 'force-static';

export function generateStaticParams() {
	return getChallenges().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
	params,
}: PageProps<'/monthlychallenges/[slug]'>): Promise<Metadata> {
	const challenge = getChallenge((await params).slug);
	if (!challenge) {
		notFound();
	}

	return await createMetaData(challenge.meta);
}

export default async function Challenge({
	params,
}: PageProps<'/monthlychallenges/[slug]'>) {
	const { slug } = await params;
	const challenge = getChallenge(slug);
	if (!challenge) {
		notFound();
	}

	const {
		default: Content,
	}: {
		default: React.ComponentType<MDXProps>;
	} = await import(`@/content/monthly-challenges/${slug}.mdx`);

	return (
		<DefaultLayout simple>
			{/* MDX reads it as `props.meta`. */}
			<Content meta={challenge.meta} />
		</DefaultLayout>
	);
}
