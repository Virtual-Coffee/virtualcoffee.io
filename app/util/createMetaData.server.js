import createSocialImage from '~/util/socialimage';

export function createMetaData({ title, description, hero, Hero }) {
	// `/assets/svg/${attributes.hero.Hero}.svg`

	return {
		title,
		description,
		'og:image': createSocialImage({
			title: title,
			subtitle: description,
			// hero,
		}),
		'twitter:image': createSocialImage({
			title: title,
			subtitle: description,
			// hero,
		}),
	};
}
