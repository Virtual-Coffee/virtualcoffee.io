import createSocialImage from '@/util/socialimage';
import type { Metadata } from 'next';

export function createMetaData({
	title,
	description,
	hero: heroPath,
	Hero,
}: {
	title?: string;
	description?: string;
	hero?: string;
	Hero?: string;
}): Metadata {
	// `/assets/svg/${attributes.hero.Hero}.svg`
	const hero = heroPath || Hero ? `/assets/svg/${Hero}.svg` : undefined;

	return {
		title,
		description,
		openGraph: {
			images: [
				createSocialImage({
					title: title,
					subtitle: description,
					hero,
				}),
			],
		},
		twitter: {
			images: [
				createSocialImage({
					title: title,
					subtitle: description,
					hero,
				}),
			],
		},
	};
}
