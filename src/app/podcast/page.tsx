import Link from 'next/link';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import PodcastSubscribe from '@/components/PodcastSubscribe';
import PostList from '@/components/PostList';
import { getEpisodes } from '@/data/podcast';
import { createMetaData } from '@/util/createMetaData.server';
import createCmsImage from '@/util/cmsimage';

export const dynamic = 'force-static';

export async function generateMetadata() {
	return await createMetaData({
		title: 'Virtual Coffee Podcast',
		description:
			'Explore nine seasons of the Virtual Coffee Podcast, where we shared the stories, lessons, and conversations from our community of developers.',
		Hero: 'UndrawWalkInTheCity',
		hero: 'UndrawWalkInTheCity',
	});
}

export default async function PodcastsIndex() {
	const podcastEpisodes = await getEpisodes({ limit: 99 });

	const latestEpisode = podcastEpisodes[0];

	return (
		<DefaultLayout
			heroHeader="Virtual Coffee Podcast"
			Hero="UndrawWalkInTheCity"
		>
			<div className="container bodycopy py-5 lead">
				<p>
					The Virtual Coffee Podcast was our way of sharing the stories,
					lessons, and conversations that grew out of the Virtual Coffee
					community.
				</p>
				<p>
					We&apos;re not currently recording new episodes, but we&apos;re
					grateful for the many guests who shared their experiences with us
					across nine seasons. These conversations reflect so much of what we
					love about Virtual Coffee: learning together, supporting one another,
					being honest about the hard parts, and celebrating the many different
					paths people take through tech.
				</p>
				<p>We hope you enjoy exploring the archive.</p>

				<hr />

				<PodcastSubscribe />

				<hr />

				<div className="text-muted">Latest Episode:</div>
				<h3>
					<Link href={latestEpisode.url!}>{latestEpisode.title}</Link>
				</h3>

				{!!latestEpisode.episodeSponsors.length && (
					<>
						<div className="mt-3">
							<h4 className="h6 text-muted font-italic">
								<small>This episode is brought to you by:</small>
							</h4>
							{latestEpisode.episodeSponsors.map((sponsor) => (
								<li key={sponsor.title} className="media align-items-center">
									<a href={sponsor.sponsorUrl}>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={createCmsImage({
												path: sponsor.sponsorImage[0].path,
												folder: 'podcast',
												settings: {
													w: 64,
												},
											})}
											className="mr-3"
											alt=""
											style={{ width: 64, height: 'auto' }}
											width={sponsor.sponsorImage[0].width}
											height={sponsor.sponsorImage[0].height}
											sizes="64px"
											srcSet={`${createCmsImage({
												path: sponsor.sponsorImage[0].path,
												folder: 'podcast',
												settings: {
													w: 64,
												},
											})} 64w, ${createCmsImage({
												path: sponsor.sponsorImage[0].path,
												folder: 'podcast',
												settings: {
													w: 128,
												},
											})} 128w, ${createCmsImage({
												path: sponsor.sponsorImage[0].path,
												folder: 'podcast',
												settings: {
													w: 192,
												},
											})} 192w`}
										/>
									</a>
									<div className="media-body">
										<span className="h5">
											<a href={sponsor.sponsorUrl}>{sponsor.title}</a>
										</span>
									</div>
								</li>
							))}
						</div>
					</>
				)}
			</div>

			<div className="bg-light py-5">
				<div className="container-xl">
					<h2 className="display-5">Episode Archive:</h2>

					<PostList
						items={podcastEpisodes.map(
							({ title, metaDescription: description, url }) => ({
								title,
								description,
								href: url,
							}),
						)}
					/>
				</div>
			</div>
		</DefaultLayout>
	);
}
