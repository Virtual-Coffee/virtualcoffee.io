import 'server-only';
import createSocialImage from '@/util/socialimage';
import type { Metadata } from 'next';

export async function createMetaData({
	title,
	description,
	hero: heroName,
	Hero,
}: {
	title?: string;
	description?: string;
	hero?: string;
	Hero?: string;
}): Promise<Metadata> {
	const name = Hero || heroName;
	const hero = name ? `/assets/svg/${name}.svg` : undefined;
	const image = createSocialImage({
		title: title,
		subtitle: description,
		hero,
	});
	return {
		title,
		description,
		openGraph: {
			images: [image],
		},
		twitter: {
			images: [image],
		},
	};
}
