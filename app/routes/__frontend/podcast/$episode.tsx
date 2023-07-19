import { useEffect, Fragment } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/node';
import DisplayHtml from '~/components/DisplayHtml';
import PodcastSubscribe from '~/components/PodcastSubscribe';
import {
	getEpisode,
	getTranscript,
	getPlayerSrc,
	getPlayerUrl,
	getPlayerStreamUrl,
	getEpisodeQueryParams,
} from '~/data/podcast';
import { dateForDisplay } from '~/util/date';
import { sanitizeCmsData } from '~/util/sanitizeCmsData';
import createCmsImage from '~/util/cmsimage';
import type { PodcastEpisode } from '~/data/podcast';

interface EpisodeLoaderArgs extends LoaderArgs {
	params: {
		episode: string;
	};
}

export const loader = async ({ params, request }: EpisodeLoaderArgs) => {
	console.log(`loading data for ${params.episode}`);

	const episode = await getEpisode({
		slug: params.episode,
		queryParams: getEpisodeQueryParams(request),
	});
	if (!episode) {
		console.error(`Episode not found - ${params.episode}`);
		throw new Response('Episode not Found', { status: 404 });
	}
	const transcript = await getTranscript({ id: episode.podcastBuzzsproutId });

	const sanitizedEpisode = sanitizeCmsData(episode);
	return json({
		episode: sanitizedEpisode,
		transcript,
		playerSrc: getPlayerSrc({ id: episode.podcastBuzzsproutId }),
		playerUrl: getPlayerUrl({ id: episode.podcastBuzzsproutId }),
		playerStreamUrl: getPlayerStreamUrl({ id: episode.podcastBuzzsproutId }),
	});
};

type PageMetadata = {
	data: {
		episode: PodcastEpisode;
		playerUrl: string;
		playerStreamUrl: string;
	};
};

export function meta({ data }: PageMetadata) {
	if (!data) return;
	const { episode, playerUrl, playerStreamUrl } = data;
	const cardImage = episode.podcastEpisodeCard && episode.podcastEpisodeCard[0];

	const title = episode.title;
	const description = episode.metaDescription;

	return {
		title: title,
		description: description,
		'fb:app_id': '1345357125835406',
		'og:type': 'video.episode',
		'og:image:width': 250,
		'og:image:height': 250,
		'og:title': title,
		'og:description': description,
		'twitter:title': title,
		'twitter:description': description,
		'twitter:card': 'player',
		'twitter:site': '@VirtualCoffeeIO',
		'twitter:player:width': '500',
		'twitter:player:height': '210',
		'twitter:player:stream:content_type': 'audio/mp3',
		'twitter:player': playerUrl,
		'twitter:player:stream': playerStreamUrl,
		...(cardImage
			? {
					'og:image': createCmsImage({
						path: cardImage.path,
						folder: 'podcast',
						settings: {
							w: 250,
						},
					}),
					'twitter:image': createCmsImage({
						path: cardImage.path,
						folder: 'podcast',
						settings: {
							w: 1200,
						},
					}),
			  }
			: {}),
	};
}

export default function PostSlug() {
	const { episode, transcript, playerSrc } = useLoaderData<typeof loader>();

	useEffect(() => {
		if (playerSrc && document) {
			const script = document.createElement('script');

			script.src = playerSrc;
			script.async = true;

			document.body.appendChild(script);

			return () => {
				document.body.removeChild(script);
			};
		}
	}, [playerSrc]);

	return (
		<main id="maincontent" className="container-lg py-md-4">
			<h1 className="display-5">{episode.title}</h1>
			<div className="text-right mb-2">
				<code>
					<span className="d-block d-sm-inline">
						Season {episode.podcastSeason}, Episode {episode.podcastEpisode}
					</span>{' '}
					<span className="d-none d-sm-inline">|</span>{' '}
					<span className="d-block d-sm-inline">
						{dateForDisplay(episode.podcastPublishDate, 'DDD')}
					</span>
				</code>
			</div>

			<DisplayHtml className="lead" html={episode.podcastShortDescription} />

			<div className="my-4 podcastplayer">
				{playerSrc && (
					<>
						<div id={`buzzsprout-player-${episode.podcastBuzzsproutId}`}></div>
					</>
				)}
			</div>

			<PodcastSubscribe />

			<hr />

			{episode.episodeSponsors.length > 0 && (
				<>
					<h3 className="h5">
						<div className="text-muted font-italic">
							<small>This episode is brought to you by:</small>
						</div>
					</h3>
					<ul className="sponsors-list-sm">
						{episode.episodeSponsors.map((sponsor) => (
							<li key={sponsor.title}>
								<a href={sponsor.sponsorUrl}>
									<img
										src={createCmsImage({
											path: sponsor.sponsorImage[0].path,
											folder: 'podcast',
											settings: {
												w: 80,
											},
										})}
										className="mr-3"
										alt=""
										width={sponsor.sponsorImage[0].width}
										height={sponsor.sponsorImage[0].height}
										sizes="(min-width: 768px) 400, calc(100vw - 60px)"
										srcSet={`${createCmsImage({
											path: sponsor.sponsorImage[0].path,
											folder: 'podcast',
											settings: {
												w: 80,
											},
										})} 80w, ${createCmsImage({
											path: sponsor.sponsorImage[0].path,
											folder: 'podcast',
											settings: {
												w: 160,
											},
										})} 160w, ${createCmsImage({
											path: sponsor.sponsorImage[0].path,
											folder: 'podcast',
											settings: {
												w: 240,
											},
										})} 240w, ${createCmsImage({
											path: sponsor.sponsorImage[0].path,
											folder: 'podcast',
											settings: {
												w: 480,
											},
										})} 480w, ${createCmsImage({
											path: sponsor.sponsorImage[0].path,
											folder: 'podcast',
											settings: {
												w: 720,
											},
										})} 720w`}
									/>
								</a>

								<div className="sponsors-body">
									<h4>
										<a href={sponsor.sponsorUrl}>{sponsor.title}</a>
									</h4>
									<DisplayHtml html={sponsor.sponsorDescription} />
								</div>
							</li>
						))}
					</ul>
					<hr />
				</>
			)}

			<div className="row">
				<div className="col-md-5 col-lg-4 order-md-2 pb-4 pb-md-0">
					{episode.podcastGuests.map((guest) => {
						const headshot = guest.headshot[0];
						return (
							<div className="card mb-4" key={guest.id}>
								<div className="row no-gutters">
									<div className="col-sm-4 col-md-12">
										{headshot && (
											<img
												alt=""
												className="card-img-top"
												src={createCmsImage({
													path: headshot.path,
													folder: 'podcast',
													settings: {
														w: 258,
													},
												})}
												sizes="(min-width: 1200px) 338px, (min-width: 992px) 258px, (min-width: 768px) calc((100vw - 150px) * (5 / 12)), (min-width: 576px) calc((100vw - 60px) / 3), calc(100vw - 60px)"
												srcSet={`${createCmsImage({
													path: headshot.path,
													folder: 'podcast',
													settings: {
														w: 1352,
													},
												})} 1352w, ${createCmsImage({
													path: headshot.path,
													folder: 'podcast',
													settings: {
														w: 1032,
													},
												})} 1032w, ${createCmsImage({
													path: headshot.path,
													folder: 'podcast',
													settings: {
														w: 1026,
													},
												})} 1026w, ${createCmsImage({
													path: headshot.path,
													folder: 'podcast',
													settings: {
														w: 704,
													},
												})} 704w, ${createCmsImage({
													path: headshot.path,
													folder: 'podcast',
													settings: {
														w: 676,
													},
												})} 676w, ${createCmsImage({
													path: headshot.path,
													folder: 'podcast',
													settings: {
														w: 516,
													},
												})} 516w, ${createCmsImage({
													path: headshot.path,
													folder: 'podcast',
													settings: {
														w: 513,
													},
												})} 513w, ${createCmsImage({
													path: headshot.path,
													folder: 'podcast',
													settings: {
														w: 352,
													},
												})} 352w, ${createCmsImage({
													path: headshot.path,
													folder: 'podcast',
													settings: {
														w: 338,
													},
												})} 338w`}
											/>
										)}
									</div>
									<div className="col-sm-8 col-md-12">
										<div className="card-body">
											<h5 className="card-title">{guest.guestName}</h5>
											<DisplayHtml html={guest.guestBio} />
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
				<div className="col-md-7 col-lg-8 order-md-1">
					<h3>Show Notes:</h3>

					<DisplayHtml html={episode.podcastShowNotes} />

					<hr />

					<h4>Sponsor Virtual Coffee!</h4>

					<p>
						Your support is incredibly valuable to us. Direct financial support
						will help us to continue serving the Virtual Coffee community.
					</p>

					<p>
						Please visit{' '}
						<a href="https://github.com/sponsors/Virtual-Coffee">
							our sponsorship page on GitHub
						</a>{' '}
						for more information - you can even{' '}
						<a href="https://github.com/sponsors/Virtual-Coffee?frequency=one-time">
							sponsor an episode of the podcast!
						</a>{' '}
					</p>

					<h5>Virtual Coffee:</h5>
					<ul>
						<li>
							Virtual Coffee:{' '}
							<a href="https://virtualcoffee.io/">virtualcoffee.io</a>
						</li>
						<li>
							Podcast Contact:{' '}
							<a href="mailto:podcast@virtualcoffee.io">
								podcast@virtualcoffee.io
							</a>
						</li>
						<li>
							Bekah: <a href="https://dev.to/bekahhw">dev.to/bekahhw</a>,
							Twitter:{' '}
							<a href="https://twitter.com/bekahhw">
								https://twitter.com/bekahhw
							</a>
							, Instagram:{' '}
							<a href="https://www.instagram.com/bekahhw">bekahhw</a>
						</li>
						<li>
							Dan: <a href="https://dtott.com">dtott.com</a>, Twitter:{' '}
							<a href="https://twitter.com/danieltott">@danieltott</a>
						</li>
					</ul>

					{transcript && (
						<>
							<hr />
							<h3>Transcript:</h3>
							<dl className="transcript">
								{transcript.map((line, i) => (
									<Fragment key={i}>
										<dt>
											{line.name}: <time>{line.timestamp}</time>
										</dt>
										<dd>
											<p>{line.text}</p>
										</dd>
									</Fragment>
								))}
							</dl>
						</>
					)}
					<hr />
					<p>
						<em>
							The Virtual Coffee Podcast is produced by Dan Ott and Bekah Hawrot
							Weigel and edited by{' '}
							{episode.podcastSeason === 4
								? 'Andy Bonjour at GoodDay Communications'
								: 'Dan Ott'}
							.
						</em>
					</p>
				</div>
			</div>
		</main>
	);
}
