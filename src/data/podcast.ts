import { unstable_cache } from 'next/cache';
import rawEpisodes from './podcast/episodes.json';

export const buzzsproutPodcastId = '1558601' as const;

// episodes.json is sourced from vc-data and bundled here at build time.
// To update: copy the latest episodes.json from Virtual-Coffee/vc-data into
// src/data/podcast/episodes.json and open a PR.
// https://github.com/Virtual-Coffee/vc-data/blob/main/podcast/episodes.json

const IMGIX_PREFIX = 'https://virtualcoffeeio-cms.imgix.net/podcast/';

/** Strip the full imgix URL down to just the filename, which is what createCmsImage expects. */
function extractPath(fullUrl: string | null | undefined): string {
	if (!fullUrl) return '';
	return fullUrl.startsWith(IMGIX_PREFIX)
		? fullUrl.slice(IMGIX_PREFIX.length)
		: fullUrl;
}

// ---------------------------------------------------------------------------
// Types that match the shape the rest of the app expects (unchanged from before)
// ---------------------------------------------------------------------------

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
	podcastEpisodeCard: Array<{ path: string }>;
	url: string;
	episodeSponsors: Array<{
		title: string;
		sponsorUrl: string;
		sponsorImage: Array<{ path: string; width: number; height: number }>;
		sponsorDescription: { renderHtml: string };
	}>;
}

type PodcastEpisodes = Pick<
	PodcastEpisode,
	| 'title'
	| 'slug'
	| 'id'
	| 'metaDescription'
	| 'podcastEpisode'
	| 'podcastSeason'
	| 'podcastPublishDate'
	| 'podcastBuzzsproutId'
	| 'url'
	| 'episodeSponsors'
>[];

// ---------------------------------------------------------------------------
// Shape of data in episodes.json (sourced from vc-data)
// ---------------------------------------------------------------------------

interface VcDataEpisode {
	title: string;
	slug: string;
	id: string;
	metaDescription: string;
	season: number;
	episode: number;
	buzzsproutId: string;
	publishDate: string;
	shortDescription: string;
	showNotes: string;
	episodeCard: string;
	guests: Array<{
		guestName: string;
		guestBio: string;
		headshot: string | null;
	}>;
	sponsors: Array<{
		title: string;
		url: string;
		logo: string | null;
		logoWidth: number;
		logoHeight: number;
		description: string;
	}>;
}

// ---------------------------------------------------------------------------
// Mapping: vc-data shape → legacy Craft shape the app expects
// ---------------------------------------------------------------------------

function mapEpisode(e: VcDataEpisode): PodcastEpisode {
	return {
		title: e.title,
		slug: e.slug,
		id: e.id,
		metaDescription: e.metaDescription,
		podcastEpisode: e.episode,
		podcastSeason: e.season,
		podcastPublishDate: e.publishDate,
		podcastBuzzsproutId: e.buzzsproutId,
		podcastShortDescription: { renderHtml: e.shortDescription },
		podcastShowNotes: { renderHtml: e.showNotes },
		podcastEpisodeCard: e.episodeCard
			? [{ path: extractPath(e.episodeCard) }]
			: [],
		podcastGuests: (e.guests || []).map((g, i) => ({
			id: i,
			guestName: g.guestName,
			guestBio: { renderHtml: g.guestBio },
			headshot: g.headshot ? [{ path: extractPath(g.headshot) }] : [],
		})),
		episodeSponsors: (e.sponsors || []).map((s) => ({
			title: s.title,
			sponsorUrl: s.url,
			sponsorImage: s.logo
				? [
						{
							path: extractPath(s.logo),
							width: s.logoWidth,
							height: s.logoHeight,
						},
					]
				: [],
			sponsorDescription: { renderHtml: s.description },
		})),
		url: `/podcast/${e.slug}`,
	};
}

// Map all episodes once at module load (bundled JSON, no async needed)
const allMappedEpisodes: PodcastEpisode[] = (
	rawEpisodes as unknown as VcDataEpisode[]
).map(mapEpisode);

// ---------------------------------------------------------------------------
// Public API (same signatures as before)
// ---------------------------------------------------------------------------

export const getEpisodes = unstable_cache(
	async ({ limit = 5 }: { limit?: number } = {}): Promise<PodcastEpisodes> => {
		return allMappedEpisodes.slice(0, limit);
	},
	['podcast', 'episodes'],
	{ revalidate: false, tags: ['podcast'] },
);

export const getEpisode = unstable_cache(
	async ({
		slug,
	}: {
		slug: PodcastEpisode['slug'];
		queryParams?: string;
	}): Promise<PodcastEpisode | null> => {
		return allMappedEpisodes.find((e) => e.slug === slug) ?? null;
	},
	['podcast', 'episode'],
	{ revalidate: false, tags: ['podcast'] },
);

// ---------------------------------------------------------------------------
// Transcript — unchanged, reads from feeds.virtualcoffee.io
// ---------------------------------------------------------------------------

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

export const getTranscript = unstable_cache(
	async ({ id }: Partial<PodcastEpisode>): Promise<Transcript | null> => {
		try {
			const response: { segments: TranscriptSegment[] } = await fetch(
				`https://feeds.virtualcoffee.io/podcast-assets/${id}/transcript.json`,
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
	},
	['podcast', 'transcript'],
	{ revalidate: 86400, tags: ['podcast'] },
);

// ---------------------------------------------------------------------------
// Kept for backwards compatibility — no longer needed with vc-data
// but removing it would be a breaking change if anything imports it.
// ---------------------------------------------------------------------------

export async function getEpisodeQueryParams(_request: Request) {
	return '';
}
