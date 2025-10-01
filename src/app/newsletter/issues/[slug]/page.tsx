import { createMetaData } from '@/util/createMetaData.server';
import NewsletterSubscribe from '@/components/NewslettterSubscribe';
import { getNewsletter, getNewsletters } from '@/data/newsletters';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { NextPageProps } from '@/util/types';
import { notFound } from 'next/navigation';

export const metadata = createMetaData({
	title: 'Virtual Coffee Newsletter',
	description: 'Sign up for the Virtual Coffee Newsletter.',
	Hero: 'UndrawArrived',
});

export async function generateStaticParams() {
	const newsletters = await getNewsletters();

	return newsletters.map((newsletter) => ({
		slug: newsletter.href.replace('/newsletter/issues/', ''),
	}));
}

export default async function Newsletter({ params }: NextPageProps<'slug'>) {
	const newsletter = await getNewsletter((await params).slug);

	if (!newsletter) {
		notFound();
	}

	return (
		<DefaultLayout
			simple={true}
			heroHeader={newsletter.handle.meta.title}
			heroSubheader={newsletter.handle.meta.description}
		>
			<newsletter.Page />
			<hr />
			<NewsletterSubscribe />
		</DefaultLayout>
	);
}
