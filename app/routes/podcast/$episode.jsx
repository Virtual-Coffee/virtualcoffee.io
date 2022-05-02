import { useEffect, Fragment } from 'react';
import { json, useLoaderData } from 'remix';
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

export const loader = async ({ params, request }) => {
	console.log(`loading data for ${params.episode}`);

	const episode = await getEpisode({
		slug: params.episode,
		queryParams: getEpisodeQueryParams(request),
	});

	const transcript = await getTranscript({ id: episode.podcastBuzzsproutId });

	const sanitizedEpisode = await sanitizeCmsData(episode);
	return json({
		episode: sanitizedEpisode,
		transcript,
		playerSrc: getPlayerSrc({ id: episode.podcastBuzzsproutId }),
		playerUrl: getPlayerUrl(episode.podcastBuzzsproutId),
		playerStreamUrl: getPlayerStreamUrl(episode.podcastBuzzsproutId),
	});
};

export function meta({ data: { episode, playerUrl, playerStreamUrl } }) {
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
					'og:image': cardImage.w_250,
					'twitter:image': cardImage.w_1200,
			  }
			: {}),
	};
}

export default function PostSlug() {
	const { episode, transcript, playerSrc } = useLoaderData();

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
												src={headshot.w_258}
												sizes="(min-width: 1200px) 338px, (min-width: 992px) 258px, (min-width: 768px) calc((100vw - 150px) * (5 / 12)), (min-width: 576px) calc((100vw - 60px) / 3), calc(100vw - 60px)"
												srcSet={`${headshot.w_1352} 1352w, ${headshot.w_1032} 1032w, ${headshot.w_1026} 1026w, ${headshot.w_704} 704w, ${headshot.w_676} 676w, ${headshot.w_516} 516w, ${headshot.w_513} 513w, ${headshot.w_352} 352w, ${headshot.w_338} 338w`}
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
							Weigel and edited by Andy Bonjour at GoodDay Communications.
						</em>
					</p>
				</div>
			</div>
		</main>
	);
}
