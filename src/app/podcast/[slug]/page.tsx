import { NextPageProps } from '@/util/types';
import { notFound } from 'next/navigation';

import { Fragment } from 'react';
import CdnImage from '@/components/CdnImage';
import DisplayHtml from '@/components/DisplayHtml';
import PodcastSubscribe from '@/components/PodcastSubscribe';
import { getEpisode, getEpisodes, getTranscript } from '@/data/podcast';
import { dateForDisplay } from '@/util/date';
import { sanitizeCmsData } from '@/util/sanitizeCmsData';
import createCmsImage, { cmsImageUrl } from '@/util/cmsimage';
import { Metadata } from 'next';

export const dynamic = 'force-static';

export async function generateStaticParams() {
	const podcastEpisodes = await getEpisodes({ limit: 99 });

	return podcastEpisodes.map((pod) => ({
		slug: pod.slug,
	}));
}

/**
 * Route params arrive percent-encoded, while `episodes.json` stores slugs as
 * written — two episodes have a non-ASCII character in theirs (`jörn`,
 * `ramón`), so an undecoded lookup misses them and the page 404s.
 *
 * `decodeURIComponent` throws on a malformed escape like a bare `%`, which
 * anyone can type into the address bar; falling back to the raw slug turns that
 * into the 404 below rather than a 500.
 */
function decodeSlug(slug: string) {
	try {
		return decodeURIComponent(slug);
	} catch {
		return slug;
	}
}

async function getEpisodeData(slug: string) {
	const episode = await getEpisode({
		slug: decodeSlug(slug),
		// TODO: enable CMS previews
		// queryParams: getEpisodeQueryParams(request),
	});
	if (!episode) {
		console.error(`Episode not found - ${slug}`);
		notFound();
	}
	const transcript = await getTranscript({ id: episode.podcastBuzzsproutId });

	const sanitizedEpisode = sanitizeCmsData(episode);
	return {
		episode: sanitizedEpisode,
		transcript,
	};
}

export async function generateMetadata({
	params,
}: NextPageProps<'slug'>): Promise<Metadata> {
	const { episode } = await getEpisodeData((await params).slug);

	const cardImage = episode.podcastEpisodeCard && episode.podcastEpisodeCard[0];

	const title = episode.title;
	const description = episode.metaDescription;

	return {
		title: title,
		description: description,
		openGraph: {
			type: 'video.episode',
			images: cardImage
				? [
						{
							url: createCmsImage({
								path: cardImage.path,
								folder: 'podcast',
								settings: {
									w: 250,
								},
							}),
							width: 250,
							height: 250,
						},
					]
				: [],
			title: title,
			description: description,
		},
		twitter: {
			title: title,
			description: description,
			card: 'player',
			site: '@VirtualCoffeeIO',
			images: cardImage
				? [
						{
							url: createCmsImage({
								path: cardImage.path,
								folder: 'podcast',
								settings: {
									w: 1200,
								},
							}),
							width: 1200,
							height: 630,
						},
					]
				: [],
		},
	};
}

export default async function Newsletter({ params }: NextPageProps<'slug'>) {
	const { episode, transcript } = await getEpisodeData((await params).slug);

	return (
		<>
			<main id="maincontent" className="container-lg py-md-4">
				<h1 className="display-5">{episode.title}</h1>
				<div className="text-end mb-2">
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

				<PodcastSubscribe />

				<hr />

				{episode.episodeSponsors.length > 0 && (
					<>
						<h3 className="h5">
							<div className="text-muted fst-italic">
								<small>This episode is brought to you by:</small>
							</div>
						</h3>
						<ul className="sponsors-list-sm">
							{episode.episodeSponsors.map((sponsor) => (
								<li key={sponsor.title}>
									<a href={sponsor.sponsorUrl}>
										<CdnImage
											src={cmsImageUrl({
												path: sponsor.sponsorImage[0].path,
												folder: 'podcast',
											})}
											className="me-3"
											alt=""
											width={sponsor.sponsorImage[0].width}
											height={sponsor.sponsorImage[0].height}
											sizes="(min-width: 768px) 400px, calc(100vw - 60px)"
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
									<div className="row g-0">
										<div className="col-sm-4 col-md-12">
											{headshot && (
												<CdnImage
													alt=""
													className="card-img-top"
													src={cmsImageUrl({
														path: headshot.path,
														folder: 'podcast',
													})}
													// Headshots carry no dimensions in episodes.json and
													// range from 1:1 to 4:3 to 3:4, so these only reserve
													// space; `height: auto` lets each image's real ratio
													// win once it loads, as it does today.
													width={400}
													height={400}
													style={{ height: 'auto' }}
													sizes="(min-width: 1200px) 338px, (min-width: 992px) 258px, (min-width: 768px) calc((100vw - 150px) * (5 / 12)), (min-width: 576px) calc((100vw - 60px) / 3), calc(100vw - 60px)"
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
							Your support is incredibly valuable to us. Direct financial
							support will help us to continue serving the Virtual Coffee
							community.
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
								The Virtual Coffee Podcast is produced by Dan Ott and Bekah
								Hawrot Weigel and edited by{' '}
								{episode.podcastSeason === 4
									? 'Andy Bonjour at GoodDay Communications'
									: 'Dan Ott'}
								.
							</em>
						</p>
					</div>
				</div>
			</main>
		</>
	);
}
