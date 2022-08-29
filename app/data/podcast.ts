import { GraphQLClient, gql } from 'graphql-request';

export const buzzsproutPodcastId = '1558601' as const;

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
							path
						}
					}
				}
				podcastEpisodeCard {
					path
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

export function getEpisodeQueryParams(request: Request) {
	const url = new URL(request.url);

	const sp = new URLSearchParams();
	const craftPreview = url.searchParams.get('x-craft-preview');
	if (craftPreview) {
		sp.set('x-craft-preview', craftPreview);
	}

	const token = url.searchParams.get('token');
	if (token) {
		sp.set('token', token);
	}

	return sp.toString();
}

export interface PodcastEpisode {
	title: string;
	slug: string;
	id: string;
	metaDescription: string;
	podcastEpisode: number;
	podcastSeason: number;
	podcastPublishDate: string;
	podcastBuzzsproutId: string;
	podcastShortDescription: {
		renderHtml: string;
	};
	podcastShowNotes: {
		renderHtml: string;
	};
	podcastGuests: Array<{
		id: number | string;
		guestName: string;
		guestBio: { renderHtml: string };
		headshot: Array<{ path: string }>;
	}>;
	podcastEpisodeCard?: Array<{ path: string }>;
	url?: string;
}
type PodcastEpisodes = Partial<PodcastEpisode>[];
type PodcastEpisodeResponse = {
	entries: PodcastEpisode[];
};

export async function getEpisodes({
	limit = 5,
}: { limit?: number } = {}): Promise<PodcastEpisodes> {
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
		const episodesResponse: PodcastEpisodeResponse =
			await graphQLClient.request(episodesQuery, {
				limit,
			});
		return episodesResponse.entries.map((entry) => ({
			...entry,
			url: `/podcast/${entry.slug}`,
		}));
	} catch (e) {
		console.error(e);
		return [];
	}
}

export async function getEpisode({
	slug,
	queryParams = '',
}: {
	slug: PodcastEpisode['slug'];
	queryParams?: any;
}): Promise<PodcastEpisode | null | undefined> {
	if (!(process.env.CMS_URL && process.env.CMS_TOKEN)) {
		const fakeData = await import('./mocks/podcast.server');
		const episode = fakeData.getEpisode({ slug });
		return {
			...episode,
			url: `/podcast/${episode.slug}`,
		};
	}

	const graphQLClient = new GraphQLClient(
		`${process.env.CMS_URL}/api?${queryParams || ''}`,
		{
			headers: {
				Authorization: `bearer ${process.env.CMS_TOKEN}`,
			},
		},
	);

	try {
		console.log('requesting');
		const episodesResponse: { entry: PodcastEpisode } =
			await graphQLClient.request(episodeQuery, {
				slug,
			});
		console.log('finished:');

		// return response.slice(0, 10);
		if (!episodesResponse.entry) {
			return null;
		}

		return {
			...episodesResponse.entry,
			url: `/podcast/${episodesResponse.entry.slug}`,
		};
	} catch (e) {
		console.error(e);
	}
}

type TranscriptSegment = {
	speaker: string;
	startTime: number;
	endTime: number;
	body: string;
};
type TranscriptItem = {
	name: string;
	text: string;
	timestamp: string;
};
type Transcript = Array<TranscriptItem>;

export async function getTranscript({
	id,
}: Partial<PodcastEpisode>): Promise<Transcript | null> {
	try {
		const response = await fetch(
			`https://www.buzzsprout.com/${buzzsproutPodcastId}/${id}/transcript.json`,
		).then((res) => res.json());

		if (response && response.segments) {
			return response.segments.reduce(
				(arr: Transcript, segment: TranscriptSegment) => {
					if (arr.length && arr[arr.length - 1].name === segment.speaker) {
						const cur: TranscriptItem | undefined = arr.pop();
						if (typeof cur === 'undefined') return [...arr];
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
				},
				[],
			);
		}

		console.log('no response.segments');

		return null;
	} catch (error) {
		console.error(`Error loading transcript ${id}`, error);
		return null;
	}
}

export function getPlayerSrc({ id }: Pick<PodcastEpisode, 'id'>) {
	return `https://www.buzzsprout.com/${buzzsproutPodcastId}/${id}.js?container_id=buzzsprout-player-${id}&player=small`;
}

export function getPlayerUrl({ id }: Pick<PodcastEpisode, 'id'>) {
	return `https://www.buzzsprout.com/${buzzsproutPodcastId}/${id}?client_source=twitter_card&amp;player_type=full_screen`;
}

export function getPlayerStreamUrl({ id }: Pick<PodcastEpisode, 'id'>) {
	return `https://www.buzzsprout.com/${buzzsproutPodcastId}/${id}.mp3?blob_id=${id}&client_source=twitter_card`;
}
