import { GraphQLClient, gql } from 'graphql-request';

export const buzzsproutPodcastId = '1558601';

const episodeQuery = gql`
	query getEpisode($slug: String!) {
		entry(section: "podcast", slug: [$slug]) {
			title
			... on podcast_default_Entry {
				id
				metaDescription
				podcastEpisode
				podcastBuzzsproutId
				podcastPublishDate
				podcastSeason
				podcastShortDescription {
					renderHtml
				}
				podcastShowNotes {
					renderHtml
				}
				podcastGuests {
					... on podcastGuests_guest_BlockType {
						id
						guestName
						guestBio {
							renderHtml
						}
						headshot {
							w_1352: url(width: 1352)
							w_1032: url(width: 1032)
							w_1026: url(width: 1026)
							w_704: url(width: 704)
							w_676: url(width: 676)
							w_516: url(width: 516)
							w_513: url(width: 513)
							w_352: url(width: 352)
							w_338: url(width: 338)
						}
					}
				}
				podcastEpisodeCard {
					w_250: url(width: 250)
					w_1200: url(width: 1200)
				}
			}
		}
	}
`;

const episodesQuery = gql`
	query getEpisodes($limit: Int!) {
		entries(section: "podcast", limit: $limit) {
			title
			slug
			... on podcast_default_Entry {
				id
				metaDescription
				podcastEpisode
				podcastSeason
				podcastPublishDate
				podcastBuzzsproutId
			}
		}
	}
`;

export async function getEpisodes({ limit = 5 } = {}) {
	if (!(process.env.CMS_URL && process.env.CMS_TOKEN)) {
		const fakeData = await import('./mocks/podcast.server');
		return fakeData.getEpisodes({ limit }).map((entry) => ({
			...entry,
			url: `/podcast/${entry.slug}`,
		}));
	}

	const graphQLClient = new GraphQLClient(`${process.env.CMS_URL}/api`, {
		headers: {
			Authorization: `bearer ${process.env.CMS_TOKEN}`,
		},
	});

	try {
		const episodesResponse = await graphQLClient.request(episodesQuery, {
			limit,
		});

		// return response.slice(0, 10);

		// console.log(eventsResponse);
		return episodesResponse.entries.map((entry) => ({
			...entry,
			url: `/podcast/${entry.slug}`,
		}));
	} catch (e) {
		console.error(e);
		return [];
	}
}

export async function getEpisode({ slug } = {}) {
	if (!(process.env.CMS_URL && process.env.CMS_TOKEN)) {
		const fakeData = await import('./mocks/podcast.server');
		const episode = fakeData.getEpisode({ slug });
		return {
			...episode,
			url: `/podcast/${episode.slug}`,
		};
	}

	const graphQLClient = new GraphQLClient(`${process.env.CMS_URL}/api`, {
		headers: {
			Authorization: `bearer ${process.env.CMS_TOKEN}`,
		},
	});

	try {
		const episodesResponse = await graphQLClient.request(episodeQuery, {
			slug,
		});

		// return response.slice(0, 10);

		// console.log(eventsResponse);
		return episodesResponse.entry
			? {
					...episodesResponse.entry,
					url: `/podcast/${episodesResponse.entry.slug}`,
			  }
			: null;
	} catch (e) {
		console.error(e);
		return [];
	}
}

export async function getTranscript({ id }) {
	try {
		const response = await fetch(
			`https://www.buzzsprout.com/${buzzsproutPodcastId}/${id}/transcript.json`,
		).then((res) => res.json());

		if (response && response.segments) {
			return response.segments.reduce((arr, segment) => {
				if (arr.length && arr[arr.length - 1].name === segment.speaker) {
					const cur = arr.pop();
					return [
						...arr,
						{
							...cur,
							text: cur.text + ' ' + segment.body,
						},
					];
				} else {
					const date = new Date(0);
					date.setSeconds(segment.startTime);

					return [
						...arr,
						{
							name: segment.speaker,
							text: segment.body,
							timestamp: date.toISOString().substr(14, 5),
						},
					];
				}
			}, []);
		}

		console.log('no response.segments');
		console.log(response);

		return null;
	} catch (error) {
		console.log(`Error loading transcript ${id}`, error);
		return null;
	}
}

export function getPlayerSrc({ id }) {
	return `https://www.buzzsprout.com/${buzzsproutPodcastId}/${id}.js?container_id=buzzsprout-player-${id}&player=small`;
}

export function getPlayerUrl({ id }) {
	return `https://www.buzzsprout.com/${buzzsproutPodcastId}/${id}?client_source=twitter_card&amp;player_type=full_screen`;
}

export function getPlayerStreamUrl({ id }) {
	return `https://www.buzzsprout.com/${buzzsproutPodcastId}/${id}.mp3?blob_id=${id}&client_source=twitter_card`;
}
