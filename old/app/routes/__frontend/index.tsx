import VirtualCoffeeFullBanner from '~/svg/VirtualCoffeeFullBanner';
import type { LoaderArgs } from '@remix-run/node';
import getSponsors from '~/data/sponsors';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getEvents } from '~/data/events';
import { getEpisodes } from '~/data/podcast';
import HomePageBlock from '~/components/HomePageBlock';
import PostList, {
	formatFileListItemsForPostList,
} from '~/components/PostList';
import { dateForDisplay } from '~/util/date';
import { loadMdxDirectory } from '~/util/loadMdx.server';
import { getNewsletters } from '~/data/newsletters';

export const loader = async (args: LoaderArgs) => {
	const [sponsors, events, podcastEpisodes, newsletters] = await Promise.all([
		getSponsors(),
		getEvents({
			limit: 5,
		}),
		getEpisodes(),
		getNewsletters({ limit: 5 }),
	]);

	const resources = loadMdxDirectory({
		baseDirectory: '__frontend/resources',
		includeChildren: false,
	});

	return json({
		sponsors,
		events,
		podcastEpisodes,
		resources,
		newsletters,
	});
};

export const homePageLinks = [
	{
		to: '/join',
		title: 'Join Virtual Coffee',
		description: 'Learn how to join our community',
	},
	{
		to: '/about',
		title: 'About Virtual Coffee',
		description: `Our Mission, Core Values, History, and more.`,
	},
	{
		to: '/code-of-conduct',
		title: 'Code of Conduct',
		description: `In order to create a welcoming and inclusive community, we ask our members to abide by our Code of Conduct.`,
	},
	{
		to: '/members',
		title: 'Our Members',
		description: `Meet our amazing members!`,
	},
	{
		to: '/monthlychallenges',
		title: 'Monthly Challenges',
		description: `Every month, we create a challenge for our Virtual Coffee members to complete together`,
	},
	{
		href: 'https://store.virtualcoffee.io',
		title: 'Merch Store',
		description: `Support Virtual Coffee and show your love ❤️`,
	},
	{
		href: 'https://github.com/Virtual-Coffee',
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
	const { sponsors, events, podcastEpisodes, resources, newsletters } =
		useLoaderData<typeof loader>();

	return (
		<>
			<div className="hero">
				<div className="container pt-5 pb-5 pt-sm-6">
					<h1>
						{/* @ts-ignore */}
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
							Anyone can join! Whether you're thinking about getting into tech
							or have been in it for decades.
						</p>
					</div>
				</div>
			</div>

			<main id="maincontent">
				<div className="container-lg py-5">
					<h2 className="text-center mb-5">What we're up to</h2>
					<div className="homepageblocks homepageblocks-wide">
						{/* @ts-ignore */}
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
							If you'd like to support Virtual Coffee, please visit{' '}
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
								<li>
									<a href="https://dub.sh/PWT19Ra">
										<svg
											aria-hidden="true"
											width="1216"
											height="353"
											viewBox="0 0 1216 353"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											className="p-3"
										>
											<ellipse
												cx="176.412"
												cy="176.384"
												rx="55.1172"
												ry="55.1174"
												fill="#131316"
											/>
											<path
												d="M275.721 306.885C280.41 311.574 279.939 319.338 274.429 323.028C246.394 341.807 212.676 352.759 176.399 352.759C140.122 352.759 106.403 341.807 78.3679 323.029C72.858 319.338 72.3871 311.574 77.0765 306.885L117.356 266.605C120.996 262.965 126.644 262.39 131.226 264.737C144.774 271.678 160.129 275.595 176.399 275.595C192.668 275.595 208.023 271.678 221.572 264.737C226.154 262.39 231.801 262.965 235.442 266.605L275.721 306.885Z"
												fill="#131316"
											/>
											<path
												opacity="0.5"
												d="M274.443 29.7392C279.953 33.4298 280.424 41.1935 275.734 45.8829L235.455 86.1623C231.815 89.8027 226.167 90.3777 221.585 88.0304C208.036 81.0893 192.682 77.1732 176.412 77.1732C121.62 77.1732 77.2015 121.592 77.2015 176.385C77.2015 192.654 81.1176 208.009 88.0587 221.558C90.406 226.14 89.831 231.787 86.1906 235.428L45.9114 275.707C41.222 280.396 33.4583 279.925 29.7677 274.415C10.9896 246.381 0.0374756 212.662 0.0374756 176.385C0.0374756 78.9749 79.0032 0.00878906 176.412 0.00878906C212.689 0.00878906 246.408 10.9609 274.443 29.7392Z"
												fill="#131316"
											/>
											<path
												fillRule="evenodd"
												clipRule="evenodd"
												d="M575.992 35.8369C575.992 34.3149 577.226 33.0811 578.748 33.0811H620.085C621.607 33.0811 622.841 34.3149 622.841 35.8369V316.936C622.841 318.458 621.607 319.692 620.085 319.692H578.748C577.226 319.692 575.992 318.458 575.992 316.936V35.8369ZM517.653 260.069C516.554 259.121 514.913 259.192 513.857 260.188C507.415 266.269 499.869 271.134 491.601 274.527C482.53 278.252 472.779 280.126 462.943 280.039C454.637 280.285 446.367 278.864 438.643 275.864C430.92 272.863 423.905 268.347 418.032 262.593C407.363 251.702 401.223 236.151 401.223 217.613C401.223 180.504 425.911 155.122 462.943 155.122C472.876 154.985 482.717 156.997 491.763 161.012C499.963 164.652 507.328 169.858 513.428 176.314C514.472 177.419 516.204 177.546 517.353 176.552L545.261 152.404C546.401 151.417 546.54 149.695 545.534 148.572C524.542 125.114 491.656 113.002 460.383 113.002C397.415 113.002 352.766 155.476 352.766 217.966C352.766 248.873 363.863 274.898 382.576 293.276C401.288 311.653 427.947 322.448 458.708 322.448C497.278 322.448 528.322 307.657 546.523 288.683C547.591 287.57 547.473 285.798 546.305 284.79L517.653 260.069ZM850.558 231.369C850.405 232.749 849.23 233.782 847.841 233.782H703.032C701.272 233.782 699.962 235.414 700.42 237.112C707.625 263.819 729.104 279.978 758.423 279.978C768.305 280.186 778.101 278.152 787.055 274.035C795.397 270.199 802.798 264.65 808.761 257.771C809.483 256.939 810.74 256.816 811.585 257.522L840.698 282.87C841.812 283.84 841.967 285.518 841.012 286.645C823.435 307.382 794.956 322.448 755.874 322.448C695.752 322.448 650.4 280.813 650.4 217.558C650.4 186.525 661.084 160.502 678.891 142.127C688.291 132.678 699.56 125.221 712.001 120.215C724.442 115.209 737.794 112.761 751.234 113.021C812.172 113.021 851.578 155.877 851.578 215.052C851.502 220.504 851.162 225.95 850.558 231.369ZM701.29 192.964C700.778 194.665 702.093 196.322 703.869 196.322H800.155C801.935 196.322 803.25 194.655 802.755 192.945C796.192 170.232 779.543 155.074 753.684 155.074C746.078 154.832 738.51 156.209 731.494 159.108C724.48 162.009 718.183 166.364 713.037 171.875C707.627 178.01 703.626 185.203 701.29 192.964ZM994.854 113.032C996.388 113.016 997.64 114.254 997.64 115.788V162.071C997.64 163.675 996.275 164.939 994.676 164.821C990.208 164.49 985.985 164.208 983.217 164.208C947.157 164.208 925.988 189.587 925.988 222.9V316.937C925.988 318.459 924.754 319.692 923.232 319.692H881.894C880.372 319.692 879.138 318.459 879.138 316.937V118.649C879.138 117.127 880.372 115.893 881.894 115.893H923.232C924.754 115.893 925.988 117.127 925.988 118.649V146.48C925.988 146.637 926.115 146.765 926.272 146.765C926.362 146.765 926.446 146.722 926.5 146.65C942.66 125.071 966.51 113.066 991.707 113.066L994.854 113.032ZM1106.83 234.247C1107 234.066 1107.24 233.963 1107.49 233.963C1107.79 233.963 1108.08 234.122 1108.24 234.384L1160.51 318.392C1161.02 319.2 1161.9 319.692 1162.85 319.692H1209.84C1212 319.692 1213.32 317.32 1212.19 315.484L1140.48 199.784C1139.83 198.74 1139.95 197.393 1140.78 196.482L1209.87 120.254C1211.47 118.483 1210.22 115.648 1207.83 115.648H1158.8C1158.03 115.648 1157.29 115.972 1156.77 116.541L1076.84 203.675C1075.14 205.527 1072.05 204.325 1072.05 201.812V35.8369C1072.05 34.3149 1070.82 33.0811 1069.29 33.0811H1027.96C1026.43 33.0811 1025.2 34.3149 1025.2 35.8369V316.936C1025.2 318.458 1026.43 319.692 1027.96 319.692H1069.29C1070.82 319.692 1072.05 318.458 1072.05 316.936V272.702C1072.05 272.005 1072.31 271.334 1072.79 270.824L1106.83 234.247Z"
												fill="#131316"
											/>
										</svg>
										<div className="sponsors-body">
											<h3 className="h4">Clerk</h3>
											<div className="text-sm text-muted font-weight-light">
												🎃 <em>VC Hacktoberfest Sponsor</em> 🎃
											</div>
											<div>More than authentication.</div>
											<div>Complete user management.</div>
										</div>
									</a>
								</li>
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
