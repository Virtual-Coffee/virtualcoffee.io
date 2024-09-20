import createSocialImage from '~/util/socialimage';

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
}) {
	// `/assets/svg/${attributes.hero.Hero}.svg`
	const hero = heroPath || Hero ? `/assets/svg/${Hero}.svg` : undefined;

	return {
		title,
		description,
		'og:image': createSocialImage({
			title: title,
			subtitle: description,
			hero,
		}),
		'twitter:image': createSocialImage({
			title: title,
			subtitle: description,
			hero,
		}),
	};
}
