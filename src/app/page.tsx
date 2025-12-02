import VirtualCoffeeFullBanner from '@/svg/VirtualCoffeeFullBanner';
import HomePageBlock from '@/components/HomePageBlock';
import PostList, {
	formatFileListItemsForPostList,
} from '@/components/PostList';
import { getEvents } from '@/data/events';
import { dateForDisplay } from '@/util/date';
import { loadMdxDirectory } from '@/util/loadMdx.server';
import { getEpisodes } from '@/data/podcast';
import { getNewsletters } from '@/data/newsletters';
import { getSponsors } from '@/data/sponsors';
import { homePageLinks } from '@/util/homePageLinks';

// ISR: Revalidate every 12 hours
export const revalidate = 43200;

export default async function Home() {
	const resources = loadMdxDirectory({
		baseDirectory: 'content/resources',
		includeChildren: false,
	});

	const [events, podcastEpisodes, newsletters, sponsors] = await Promise.all([
		getEvents({
			limit: 5,
		}),
		getEpisodes(),
		getNewsletters({ limit: 5 }),
		getSponsors(),
	]);

	return (
		<>
			<div className="hero">
				<div className="container pt-5 pb-5 pt-sm-6">
					<h1>
						<VirtualCoffeeFullBanner />
					</h1>

					<h2 className="pt-5">
						<span>An intimate tech community for all,</span>{' '}
						<span>
							optimized for{' '}
							<strong className="gradient-text-primary">you</strong>
						</span>
					</h2>
				</div>

				<div className="container pt-3 pb-5">
					<div className="bodycopy lead">
						<p>
							Virtual Coffee is a tech community where friendships are formed
							and support is given to people at all stages of their journey.
							Join our laid-back twice-weekly conversations and our online
							events to connect with people who share your passion for
							technology.
						</p>

						<p>
							Anyone can join! Whether you&apos;re thinking about getting into
							tech or have been in it for decades.
						</p>
					</div>
				</div>
			</div>
			<main id="maincontent">
				<div className="container-lg py-5">
					<h2 className="text-center mb-5">What we&apos;re up to</h2>
					<div className="homepageblocks homepageblocks-wide">
						<HomePageBlock
							Hero="UndrawCelebration"
							id="about"
							title="All Things Virtual Coffee"
							subtitle="Links and Goodies!"
							wide
						>
							<PostList items={homePageLinks} />
						</HomePageBlock>
					</div>
					<div className="homepageblocks">
						<HomePageBlock
							Hero="UndrawConferenceCall"
							id="about"
							title="Community Events"
							subtitle="See our upcoming events!"
							linkTo="/events"
							footer="See more Community Events"
						>
							<PostList
								items={events.map((event) => {
									const eventTime = event.startDateLocalized;
									return {
										title: event.title,
										description: (
											<strong>
												<time suppressHydrationWarning dateTime={eventTime}>
													{dateForDisplay(eventTime)}
												</time>
											</strong>
										),
									};
								})}
							/>
						</HomePageBlock>
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
					</div>
					<div className="homepageblocks">
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
										title: string;
										metaDescription: string;
										url: string;
									}) => ({
										title,
										description,
										href: url,
									}),
								)}
							/>
						</HomePageBlock>
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
					</div>
				</div>
				<div className="bg-light">
					<div className="container-lg py-5">
						<h2 className="mb-4">Our Supporters</h2>

						<p className="lead">
							We are eternally grateful to our amazing supporters and sponsors!
						</p>

						<p className="lead">
							If you&apos;d like to support Virtual Coffee, please visit{' '}
							<a href="https://github.com/sponsors/Virtual-Coffee">
								our sponsorship page
							</a>{' '}
							on GitHub.
						</p>

						<div className="sponsors">
							<ul className="sponsors-list">
								{sponsors.logoSponsors.map((tier) =>
									tier.sponsors.map((supporter) => (
										<li key={supporter.id} data-id={supporter.id}>
											<a href={supporter.websiteUrl || supporter.url}>
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img
													src={supporter.avatarUrl_80}
													alt=""
													width={supporter.avatar_width || 240}
													height={supporter.avatar_height || 240}
													loading="lazy"
													decoding="async"
													sizes="(min-width: 768px) 400, calc(100vw - 60px)"
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
						</div>

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
											{/* eslint-disable-next-line @next/next/no-img-element */}
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
