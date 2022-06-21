import VirtualCoffeeFullBanner from '~/svg/VirtualCoffeeFullBanner';
import type { LoaderFunction } from '@remix-run/node';
import getSponsors, { SponsorsResponse } from '~/data/sponsors';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getEvents } from '~/data/events';
import { dateForDisplay } from '~/util/date';
import { getEpisodes } from '~/data/podcast';
import HomePageBlock from '~/components/HomePageBlock';
import PostList, {
	formatFileListItemsForPostList,
} from '~/components/PostList';
import { loadMdxDirectory } from '~/util/loadMdx.server';
import getNewsletters from '~/data/newsletters';
import getChallenges from '~/data/monthlyChallenges/getChallenges';

interface LoaderData {
	sponsors: SponsorsResponse;
	events: any;
	podcastEpisodes: any;
	resources: any;
	newsletters: any;
	challenges: any;
}

// TODO - typescript let dan do what he wants
export const loader: LoaderFunction = async () => {
	const [sponsors, events, podcastEpisodes, newsletters, challenges] =
		await Promise.all([
			getSponsors(),
			getEvents({
				limit: 5,
			}),
			getEpisodes(),
			getNewsletters({ limit: 5 }),
			getChallenges({ limit: 5 }),
		]);

	const resources = loadMdxDirectory({
		baseDirectory: 'resources',
		includeChildren: false,
	});

	return json<LoaderData>({
		sponsors,
		events,
		podcastEpisodes,
		resources,
		newsletters,
		challenges,
	});
};

export const homePageLinks = [
	{
		to: '/about/',
		title: 'About Virtual Coffee',
		description: `Our Mission, Core Values, History, and more.`,
	},
	{
		to: '/code-of-conduct/',
		title: 'Code of Conduct',
		description: `In order to create a welcoming and inclusive community, we ask our members to abide by our Code of Conduct.`,
	},
	{
		to: '/members/',
		title: 'Our Members',
		description: `Meet our amazing members!`,
	},
	{
		href: 'https://store.virtualcoffee.io/',
		title: 'Merch Store',
		description: `Support Virtual Coffee and show your love ❤️`,
	},
	{
		href: 'https://github.com/Virtual-Coffee/',
		title: 'VC GitHub',
		description: `Join our Open Source efforts!`,
	},
	{
		href: 'https://youtube.com/c/virtualcoffeeio',
		title: 'VC Videos',
		description: `Recordings of Virtual Coffee Events and Live Streams.`,
	},
	{
		href: 'https://twitter.com/VirtualCoffeeIO',
		title: 'VC Twitter',
		description: `Stay up to date and join in the fun!`,
	},
];

export default function Index() {
	const {
		sponsors,
		events,
		podcastEpisodes,
		resources,
		newsletters,
		challenges,
	} = useLoaderData<LoaderData>();

	return (
		<>
			<div className="hero">
				<div className="container pt-5 pb-5 pt-sm-6">
					<h1>
						{/* @ts-ignore */}
						<VirtualCoffeeFullBanner />
					</h1>

					<h2 className="pt-5">
						<span>An intimate community for all devs,</span>{' '}
						<span>
							optimized for{' '}
							<strong className="gradient-text-primary">you</strong>
						</span>
					</h2>
				</div>

				<div className="container pt-3 pb-5">
					<div className="bodycopy lead">
						<p>
							Virtual Coffee is a laid-back conversation with developers twice a
							week. It's the conversation that keeps going in slack. It's the
							online events that support developers at all stages of the
							journey. It's the place you go to make friends.
						</p>

						<p>
							Anyone can join! Whether you're thinking about getting into tech
							or have been in it for decades.
						</p>
					</div>
				</div>
			</div>

			<main id="maincontent">
				<div className="container-lg py-5">
					<h2 className="text-center mb-5">What we're up to</h2>
					<div className="homepageblocks">
						{/* @ts-ignore */}
						<HomePageBlock
							Hero="UndrawCelebration"
							id="about"
							title="All Things Virtual Coffee"
							subtitle="Links and Goodies!"
						>
							<PostList items={homePageLinks} />
						</HomePageBlock>

						<HomePageBlock
							Hero="UndrawConferenceCall"
							id="about"
							title="Community Events"
							subtitle="See our upcoming events!"
							linkTo="/events"
							footer="See more Community Events"
						>
							<PostList
								items={events.map((event: any) => ({
									title: event.title,
									description: (
										<strong>{dateForDisplay(event.startDateLocalized)}</strong>
									),
								}))}
							/>
						</HomePageBlock>
					</div>
					<div className="homepageblocks">
						<HomePageBlock
							Hero="UndrawFolder"
							id="resources"
							title="Member Resources"
							subtitle="A collection of resources for Virtual Coffee members"
							linkTo="/resources"
							footer="See more Member Resources"
						>
							<PostList items={formatFileListItemsForPostList(resources)} />
						</HomePageBlock>
						<HomePageBlock
							Hero="UndrawWalkInTheCity"
							id="about"
							title="Virtual Coffee Podcast"
							subtitle="Conversations with members of the community"
							linkTo="/podcast"
							footer="See more Podcast episodes"
						>
							<PostList
								items={podcastEpisodes.map(
									({
										title,
										metaDescription: description,
										url,
									}: {
										title: any;
										metaDescription: any;
										url: any;
									}) => ({
										title,
										description,
										to: url,
									}),
								)}
							/>
						</HomePageBlock>
					</div>
					<div className="homepageblocks">
						<HomePageBlock
							Hero="UndrawArrived"
							id="newsletters"
							title="Virtual Coffee Newsletter"
							subtitle="Sign up for the Virtual Coffee Newsletter"
							linkTo="/newsletter"
							footer="See more Newsletter Issues"
						>
							<PostList items={newsletters} />
						</HomePageBlock>
						<HomePageBlock
							Hero="UndrawGoodTeam"
							id="challenges"
							title="Monthly Challenges"
							subtitle="Every month, we create a challenge for our Virtual Coffee members to complete together"
							linkTo="/monthlychallenges"
							footer="See more Challenges"
						>
							<PostList items={challenges} />
						</HomePageBlock>
					</div>
				</div>
				<div className="bg-light">
					<div className="container-lg py-5">
						<h2 className="mb-4">Our Supporters</h2>

						<p className="lead">
							We are eternally grateful to our amazing supporters and sponsors!
						</p>

						<p className="lead">
							If you'd like to support Virtual Coffee, please visit{' '}
							<a href="https://github.com/sponsors/Virtual-Coffee">
								our sponsorship page
							</a>{' '}
							on GitHub.
						</p>

						<ul className="sponsors">
							{sponsors.logoSponsors.map((tier) =>
								tier.sponsors.map((supporter) => (
									<li key={supporter.id} data-id={supporter.id}>
										<a href={supporter.websiteUrl || supporter.url}>
											<img
												src={supporter.avatarUrl_80}
												alt=""
												width="240"
												height="240"
												loading="lazy"
												decoding="async"
												sizes="(min-width: 915px) 240px, 24vw"
												srcSet={`
              ${supporter.avatarUrl_80}   80w,
              ${supporter.avatarUrl_160} 160w,
              ${supporter.avatarUrl_240} 240w,
              ${supporter.avatarUrl_480} 480w,
              ${supporter.avatarUrl_720} 720w`}
											/>
											<div className="sponsors-body">
												<h3 className="h4">{supporter.name}</h3>
												{supporter.descriptionHTML && (
													<div
														dangerouslySetInnerHTML={{
															__html: supporter.descriptionHTML,
														}}
													/>
												)}
											</div>
										</a>
									</li>
								)),
							)}
						</ul>

						<ul className="supporters my-6">
							{sponsors.supporters.map((tier) =>
								tier.sponsors.map((supporter) => (
									<li
										className={`supporters-${tier.monthlyPriceInCents}`}
										key={supporter.id}
									>
										<a
											href={supporter.url}
											title={supporter.name || supporter.login}
										>
											<img
												src={supporter.avatarUrl_80}
												alt={supporter.name || supporter.login}
												width="80"
												height="80"
												loading="lazy"
												decoding="async"
												sizes="80px"
												srcSet={`
              ${supporter.avatarUrl_80}   80w,
              ${supporter.avatarUrl_160} 160w,
              ${supporter.avatarUrl_240} 240w
            `}
											/>
											<div className="supporters-name">
												<svg
													viewBox="0 0 130 130"
													xmlns="http://www.w3.org/2000/svg"
													fillRule="evenodd"
													clipRule="evenodd"
													strokeLinejoin="round"
													strokeMiterlimit="2"
													aria-hidden="true"
												>
													<path
														d="M 20 65 A 45 45 0 1 1 110 65 A 45 45 0 1 1 20 65"
														id="curve"
														fill="transparent"
														stroke="transparent"
													/>
													<text width="500">
														<textPath xlinkHref="#curve">
															✨{supporter.name || supporter.login}✨
														</textPath>
													</text>
												</svg>
											</div>
										</a>
									</li>
								)),
							)}
						</ul>

						<div className="text-center">
							<h2 className="mb-5">Thank you!!</h2>

							<p>
								<a
									href="https://github.com/sponsors/Virtual-Coffee"
									className="btn btn-primary btn-lg"
								>
									Sponsor Virtual Coffee
								</a>
							</p>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
