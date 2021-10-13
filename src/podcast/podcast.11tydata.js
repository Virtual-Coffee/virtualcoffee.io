const ImgixClient = require('@imgix/js-core');
const fetch = require('node-fetch');
const { AssetCache } = require('@11ty/eleventy-cache-assets');

const useImgix =
	process.env.USE_IMGIX || process.env.ELEVENTY_ENV === 'production';

var imgixClient = new ImgixClient({
	domain: 'virtualcoffee.imgix.net',
});

const podID = '1558601';

async function cacheWithEmpty(slug, url, duration = '5d') {
	let asset = new AssetCache(slug);
	try {
		// check if the cache is fresh within the last day
		if (asset.isCacheValid(duration)) {
			// return cached data.
			return asset.getCachedValue(); // a promise
		}
		console.log(`Caching asset ${slug}`);
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error('Bad response');
		}

		const json = await response.json();

		await asset.save(json, 'json');

		return json;
	} catch (error) {
		// console.log(error);
		console.log(`No transcript found for ${slug}`);
		await asset.save(null, 'json');
		return null;
	}
}

// /:podcast_id/:episode_id/transcript(.format)
module.exports = {
	eleventyComputed: {
		layout: (data) => data.layout || 'layouts/podcast.njk',
		metadata: (data) => {
			if (data.podcast) {
				try {
					const { card, id } = data.podcast;
					if (id && card) {
						return {
							...data.metadata,
							tags: {
								...data.metadata.tags,
								'twitter:player': `https://www.buzzsprout.com/${podID}/${id}?client_source=twitter_card&amp;player_type=full_screen`,
								'twitter:player:stream': `https://www.buzzsprout.com/${podID}/${id}.mp3?blob_id=${id}&client_source=twitter_card`,
								'og:image': useImgix
									? imgixClient.buildURL(card, {
											w: 250,
											h: 250,
											fit: 'crop',
											auto: 'compress,format',
									  })
									: card,
								'twitter:image': useImgix
									? imgixClient.buildURL(card, {
											w: 1200,
											h: 1200,
											fit: 'crop',
											auto: 'compress,format',
									  })
									: card,
							},
						};
					}
					return data.metadata;
				} catch (e) {
					console.log(e);
					return data.metadata;
				}
			}
			return data.metadata;
		},

		podcast: (data) => {
			if (data.podcast) {
				try {
					const { id } = data.podcast;
					if (id) {
						return {
							...data.podcast,
							playerSrc: `https://www.buzzsprout.com/${podID}/${id}.js?container_id=buzzsprout-player-${id}&player=small`,
						};
					}

					return data.podcast;
				} catch (e) {
					console.log(e);
					return data.podcast;
				}
			}
			return data.podcast;
		},

		transcript: async (data) => {
			// attach transcript
			try {
				if (data.podcast.id) {
					try {
						const response = await cacheWithEmpty(
							data.page.fileSlug,
							`https://www.buzzsprout.com/${podID}/${data.podcast.id}/transcript.json`,
						);

						if (response && response.segments) {
							return response.segments.reduce((arr, segment) => {
								if (
									arr.length &&
									arr[arr.length - 1].name === segment.speaker
								) {
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
					} catch (error) {
						console.log(`Error loading transcript: ${error.message}`);
					}
				}
			} catch (error) {
				console.log(error);
				return undefined;
			}

			return undefined;
		},
	},
};
