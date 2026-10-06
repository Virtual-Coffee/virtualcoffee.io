import { unstable_cache } from 'next/cache';
import rawEpisodes from './podcast/episodes.json';

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

export async function getEpisodes({
	limit = 5,
}: { limit?: number } = {}): Promise<PodcastEpisodes> {
	return allMappedEpisodes.slice(0, limit);
}

export async function getEpisode({
	slug,
}: {
	slug: PodcastEpisode['slug'];
	queryParams?: string;
}): Promise<PodcastEpisode | null> {
	return allMappedEpisodes.find((e) => e.slug === slug) ?? null;
}

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

/**
 * The uncached fetch: `null` when the episode has no transcript (a 404), a throw
 * for anything else, so `getTranscript` never caches a failure as "no
 * transcript". Exported for tests.
 */
export async function fetchTranscript({
	id,
}: Partial<PodcastEpisode>): Promise<Transcript | null> {
	const res = await fetch(
		`https://feeds.virtualcoffee.io/podcast-assets/${id}/transcript.json`,
	);

	if (res.status === 404) return null;
	if (!res.ok) {
		throw new Error(`Transcript ${id}: ${res.status} ${res.statusText}`);
	}

	const response: { segments?: TranscriptSegment[] } = await res.json();

	if (!response?.segments) return null;

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

/**
 * Cached for 24 h and tagged, so `/_cache?tag=podcast` picks up a new
 * transcript without waiting. A throw is never cached, so a failed request
 * costs one render, not a day.
 */
export const getTranscript = unstable_cache(fetchTranscript, ['transcript'], {
	revalidate: 86400,
	tags: ['podcast'],
});
