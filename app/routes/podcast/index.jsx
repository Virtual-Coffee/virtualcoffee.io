import { useEffect } from 'react';
import { useLoaderData, Link, json } from 'remix';
import { Default } from '~/components/layouts/Default';
import PodcastSubscribe from '~/components/PodcastSubscribe';
import PostList from '~/components/PostList';
import { getEpisodes, getPlayerSrc } from '~/data/podcast';
import UndrawWalkInTheCity from '~/svg/UndrawWalkInTheCity';

export const loader = async () => {
	const podcastEpisodes = await getEpisodes({ limit: 100 });

	const latestEpisode = podcastEpisodes[0];
	const latestEpisodePlayerSrc = getPlayerSrc({
		id: latestEpisode.podcastBuzzsproutId,
	});

	return json({ podcastEpisodes, latestEpisode, latestEpisodePlayerSrc });
};

export default function PodcastsIndex() {
	const { podcastEpisodes, latestEpisode, latestEpisodePlayerSrc } =
		useLoaderData();

	useEffect(() => {
		if (latestEpisodePlayerSrc && document) {
			const script = document.createElement('script');

			script.src = latestEpisodePlayerSrc;
			script.async = true;

			document.body.appendChild(script);

			return () => {
				document.body.removeChild(script);
			};
		}
	}, [latestEpisodePlayerSrc]);

	return (
		<Default heroHeader="Virtual Coffee Podcast" Hero={UndrawWalkInTheCity}>
			<div className="container bodycopy py-5">
				<p className="lead">
					This is the Virtual Coffee Podcast, where we interview members of the
					community to learn more about their stories, who they are, how they
					found Virtual Coffee, and how that influences their lives as
					developers.
				</p>

				<hr />

				<PodcastSubscribe />

				<hr />

				<div className="text-muted">Latest Episode:</div>
				<h3>
					<Link to={latestEpisode.url}>{latestEpisode.title}</Link>
				</h3>

				<div className="mt-4 podcastplayer">
					{latestEpisodePlayerSrc && (
						<>
							<div
								id={`buzzsprout-player-${latestEpisode.podcastBuzzsproutId}`}
							></div>
						</>
					)}
				</div>
			</div>

			<div className="bg-light py-5">
				<div className="container-xl">
					<h2 className="display-5">All Episodes:</h2>

					<PostList
						items={podcastEpisodes.map(
							({ title, metaDescription: description, url }) => ({
								title,
								description,
								url,
							}),
						)}
					/>
				</div>
			</div>
		</Default>
	);
}
