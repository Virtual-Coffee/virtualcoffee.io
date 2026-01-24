import createSocialImage from '@/util/socialimage';
import type { Metadata } from 'next';

export async function createMetaData({
	title,
	description,
	hero: heroPath,
	Hero,
}: {
	title?: string;
	description?: string;
	hero?: string;
	Hero?: string;
}): Promise<Metadata> {
	// `/assets/svg/${attributes.hero.Hero}.svg`
	const hero = heroPath || Hero ? `/assets/svg/${Hero}.svg` : undefined;
	const image = await createSocialImage({
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
