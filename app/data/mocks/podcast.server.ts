import slugify from '@sindresorhus/slugify';
import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';
import type { PodcastEpisode } from '../podcast';

export function getEpisodes({ limit = 5 }) {
	const today = DateTime.now();

	return new Array(limit).fill(null).map((_, i) => {
		const episode = limit - i;
		const season = 1;
		const name = faker.name.fullName();

		return {
			title: `${name} - ${faker.lorem.words(4)}`,
			slug: `0${season}${episode < 10 ? '0' + episode : episode}-${slugify(
				name,
			)}`,
			id: faker.datatype.uuid(),
			metaDescription: `Season ${season}, Episode ${episode} of the Virtual Coffee Podcast`,
			podcastEpisode: episode,
			podcastSeason: season,
			podcastPublishDate: today.plus({ days: -1 * (i + 1) * 7 }).toString(),
			podcastBuzzsproutId: '10297519',
			episodeSponsors: [],
		};
	});
}

export function getEpisode({ slug }: { slug: PodcastEpisode['slug'] }) {
	const today = DateTime.now();
	const name = faker.name.fullName();
	const season = parseInt(slug.slice(0, 2));
	const episode = parseInt(slug.slice(2, 4));

	return {
		title: `${name} - ${faker.lorem.words(4)}`,
		slug: `0${season}${episode < 10 ? '0' + episode : episode}-${slugify(
			name,
		)}`,
		id: faker.datatype.uuid(),
		metaDescription: `Season ${season}, Episode ${episode} of the Virtual Coffee Podcast`,
		podcastEpisode: episode,
		podcastSeason: season,
		podcastPublishDate: today.toString(),
		podcastBuzzsproutId: '9650635',
		podcastShortDescription: {
			renderHtml: `<p>${faker.lorem.sentence()}</p>`,
		},
		podcastShowNotes: {
			renderHtml: `<p>${faker.lorem.paragraph()}</p><p>${faker.lorem.paragraph()}</p><p>${faker.lorem.paragraph()}</p>`,
		},
		podcastGuests: [
			{
				id: faker.datatype.uuid(),
				guestName: name,
				guestBio: {
					renderHtml: `<p>${faker.lorem.sentence()}</p>`,
				},
				headshot: [{ path: faker.internet.avatar() }],
			},
		],
		podcastEpisodeCard: [{ path: 'http://placekitten.com/1200/1200' }],
		episodeSponsors: [],
	};
}
