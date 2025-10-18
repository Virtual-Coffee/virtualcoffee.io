import DefaultLayout from '@/components/layouts/DefaultLayout';
import { getTotalPairingSessions } from '@/data/monthlyChallenges/pairing-challenge';
import { createMetaData } from '@/util/createMetaData.server';
import Link from 'next/link';

export const metadata = createMetaData({
	title: 'Virtual Coffee Monthly Challenges',
	description:
		'Every month, we create a challenge for our Virtual Coffee members to complete together.',
	Hero: 'UndrawGoodTeam',
});

type Challenge<T = unknown> = {
	title: string;
	subtitle: string;
	description?: React.ReactNode;
	loaderData?: () => Promise<T>;
	renderDescription?: (challengeData: T) => React.ReactNode;
	links?: { href: string; title: string }[];
	current?: boolean;
};

const challengeList: Challenge[] = [
	{
		title: 'Month of Learning',
		subtitle: `Time to learn new things!`,
		description: (
			<>
				<p>
					The goal of this challenge is to learn something new, share what we
					have learned, and gather recommendations and resources to share with
					the community. During this challenge, we work on learning new
					dev-related things. You might deep-dive into one topic, start a small
					group that focuses on community learning, focus on a new topic every
					week, or do a little bit of everything.
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/join-virtual-coffee-in-the-month-of-learning-challenge-bdi">
						this blog post
					</a>
					.
				</p>
				<p>
					To view all of the details of this year&apos;s challenge,{' '}
					<Link href="/monthlychallenges/feb-2024">
						check out the February 2024 challenge page
					</Link>
					.
				</p>
			</>
		),
		links: [
			{
				href: '/monthlychallenges/jan-2023',
				title: 'January, 2023',
			},
			{
				href: '/monthlychallenges/jan-2022',
				title: 'January, 2022',
			},
			{
				href: '/monthlychallenges/jan-2021',
				title: 'January, 2021',
			},
		],
	},
	{
		title: 'Summer 2025 Bi-Month Challenge: Get Job Ready',
		subtitle: `There's never a bad time to update your job application materials and practice for job interviews!`,
		description: (
			<>
				<p>
					We typically hold this challenge for one month, but we are now
					transforming it into a bi-month challenge to give you more time to
					prepare for job readiness!
				</p>
				<p>
					Over the next two months, we'll work on creating, revising, or
					updating your job packet materials and that elevator pitch that might
					get you in the door. We'll also learn to network and prepare for
					interviews.
				</p>
				{/* <p>
					Learn more about this challenge in{' '}
					<a href="">
						this blog post
					</a>
					.
				</p> */}
				<p>
					To view all of the details of this year&apos;s challenge,{' '}
					<Link href="/monthlychallenges/summer-2025">
						check out the Summer 2025 Bi-Month Challenge: Get Job Ready page
					</Link>
					.
				</p>
			</>
		),
		links: [
			{
				href: '/monthlychallenges/mar-2024',
				title: 'March, 2024',
			},
			{
				href: '/monthlychallenges/feb-2023',
				title: 'February, 2023',
			},
			{
				href: '/monthlychallenges/apr-2022',
				title: 'April, 2022',
			},
			{
				href: '/monthlychallenges/mar-2021',
				title: 'March, 2021',
			},
		],
	},
	{
		title: 'Find Your Voice',
		subtitle: `Public Speaking Challenge!`,
		description: (
			<>
				<p>
					Public speaking can feel daunting, but it is a valuable skill in all
					aspects of life. This month, we will help you conquer your fears and
					become a confident, captivating speaker!
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/step-into-the-spotlight-join-our-public-speaking-monthly-challenge-52kl">
						this blog post
					</a>
					. And check out our{' '}
					<a
						href="/assets/pdfs/lightning-talk-guide.pdf"
						target="_blank"
						rel="noopener noreferrer"
					>
						Lightning Talk Guide
					</a>
					!
				</p>
				<p>
					To view all of the details of this year&apos;s challenge,{' '}
					<Link href="/monthlychallenges/apr-2024">
						check out the April 2024 challenge page
					</Link>
					.
				</p>
			</>
		),
		links: [
			{
				href: '/monthlychallenges/apr-2024',
				title: 'April, 2024',
			},
		],
	},

	{
		title: 'Creative Community Challenge',
		subtitle: `Let's make some space for the other parts of ourselves.`,
		description: (
			<>
				<p>
					Devs are more than just the code we write. This challenge is all about
					embracing self-expression. Give back to yourself by indulging in
					something just for fun. Share the art, music, poetry, sports, games,
					or other hobbies that spark your joy. We spend so much time grinding
					away on understanding things in the tech space. Let&apos;s make some
					space for the other parts of ourselves. In this challenge, we
					encourage folks to spend time working on things that aren&apos;t
					necessarily code-specific or using code to improve other hobbies and
					outlets.
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/monthly-challenge-creative-community-challenge-273l">
						this blog post
					</a>
					.
				</p>
				<p>
					To view all of the details of this year&apos;s challenge,{' '}
					<Link href="/monthlychallenges/dec-2024">
						check out the December 2024 challenge page
					</Link>
					.
				</p>
			</>
		),
		links: [
			{
				href: '/monthlychallenges/dec-2023',
				title: 'December, 2023',
			},
			{
				href: '/monthlychallenges/dec-2022',
				title: 'December, 2022',
			},
			{
				href: '/monthlychallenges/dec-2021',
				title: 'December, 2021',
			},
		],
	},
	{
		title: 'Blogging Challenge',
		subtitle: `A Community Challenge to hit a word count goal for all our tech and non-tech blogs.`,
		description: (
			<>
				<p>
					Based on the NaNoWriMo (National Novel Writing Month) Challenge, this
					challenge is the tech and non-tech take on writing and working
					together towards the goal while posting on our own blogs.
				</p>
				{/* <p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/blogging-2023-monthly-challenge-3kng">
						this blog post
					</a>
					.
				</p> */}
				<p>
					To view all of the details of this year&apos;s challenge,{' '}
					<Link href="/monthlychallenges/nov-2024">
						check out the November 2024 challenge page
					</Link>
					.
				</p>
			</>
		),
		links: [
			{
				href: '/monthlychallenges/nov-2023',
				title: 'November, 2023',
			},
			{
				href: '/monthlychallenges/nov-2022',
				title: 'November, 2022',
			},
			{
				href: '/monthlychallenges/nov-2021',
				title: 'November, 2021',
			},
			{
				href: '/monthlychallenges/nov-2020',
				title: 'November, 2020',
			},
		],
	},
	{
		current: true,
		title: 'Hacktoberfest',
		subtitle: `Participate in open source, learn, and have fun!`,
		description: (
			<>
				<p>
					This challenge is always run during October and was our first-ever
					monthly challenge. Open source maintainers will provide issues for
					Hacktoberfest, contributors will solve issues, and the community will
					support contributors and maintainers during this challenge.
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/hacktoberfest-2024-why-you-should-participate-4ffm">
						this blog post
					</a>
					.
				</p>
				<p>
					To view all of the details of this year's challenge,{' '}
					<Link href="/monthlychallenges/fall-2025">
						check out the Fall 2025 challenge page
					</Link>
					.
				</p>
			</>
		),
		links: [
			{
				href: '/monthlychallenges/oct-2024',
				title: 'October, 2024',
			},
			{
				href: '/monthlychallenges/oct-2023',
				title: 'October, 2023',
			},
			{
				href: '/monthlychallenges/oct-2022',
				title: 'October, 2022',
			},
			{
				href: '/monthlychallenges/oct-2021',
				title: 'October, 2021',
			},
		],
	},
	{
		title: 'Preptember',
		subtitle: `Get your open source projects ready and build confidence!`,
		description: (
			<>
				<p>
					This month, we focus on helping maintainers polish their repositories
					and contributors gain confidence. We have a structured 4-week approach
					to prepare for Hacktoberfest with our repository checklist and
					building skills through guided practice.
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/preptember-preparing-for-a-successful-hacktoberfest-5baa">
						this blog post
					</a>
					.
				</p>
				<p>
					To view all of the details of this year's challenge,{' '}
					<Link href="/monthlychallenges/fall-2025">
						check out the Fall 2025 challenge page
					</Link>
					.
				</p>
			</>
		),
		links: [
			{
				href: '/monthlychallenges/sept-2024',
				title: 'September, 2024',
			},
			{
				href: '/monthlychallenges/sept-2023',
				title: 'September, 2023',
			},
			{
				href: '/monthlychallenges/sept-2022',
				title: 'September, 2022',
			},
			{
				href: '/monthlychallenges/sept-2021',
				title: 'September, 2021',
			},
		],
	},
	{
		title: 'Healthy Habits for Happy Devs',
		subtitle: `This month's challenge is all about nourishing our bodies, minds, and spirits so that we can become healthier developers.`,
		description: (
			<>
				<p>
					The goal of this challenge is to build a new habit that will make you
					a healthier dev; this can be mind and body-centered (drink, move,
					read, meditate, rearrange your workstation) or code-centered (review
					your README, clean your code, refresh your GitHub repo) or both. Set
					the goal for yourself this month and define what successfully
					completing the challenge looks like. For example, it could be
					reviewing the README in 5 of your projects (one every week) or running
					2k twice a week.
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/join-virtual-coffee-in-the-healthy-habits-for-happy-devs-monthly-challenge-5b7h">
						this blog post
					</a>
					.
				</p>
			</>
		),
		links: [
			{
				href: '/monthlychallenges/aug-2022',
				title: 'August, 2022',
			},
			{
				href: '/monthlychallenges/aug-2021',
				title: 'August, 2021',
			},
		],
	},
	{
		title: 'Build in Public',
		subtitle: `Communicate what you're working on, show your development, and be confident and proud of any progress made.`,
		description: (
			<>
				<p>
					In this challenge, we&apos;re working on creating a habit of talking
					about the things we&apos;re working on, a plan for continuing
					progress, and creating a demo for the Virtual Coffee community.
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/join-virtual-coffee-for-the-build-in-public-the-power-of-daily-standup-and-demo-challenge-35kb">
						this blog post
					</a>
					.
				</p>
			</>
		),
		links: [
			{
				href: '/monthlychallenges/july-2022',
				title: 'July, 2022',
			},

			{
				href: '/monthlychallenges/july-2021',
				title: 'July, 2021',
			},
			{
				href: '/monthlychallenges/june-2021',
				title: 'June, 2021',
			},
		],
	},
	{
		title: 'Community Kindness',
		subtitle: `Celebrating our Community as we move into a new year of Virtual Coffee!`,
		description: (
			<>
				<p>
					As we work hard to make sure this community continues to be the
					special and close-knit group, this challenge encourages our members to
					celebrate one of the things that continually makes this community so
					special: Kindness. Some of the ways we see this include: practicing
					gratitude, reaching out to support other members, mentoring, helping,
					giving honest and constructive feedback, and continuing to make
					Virtual Coffee a safe and supportive space.
				</p>
				<p>
					To view all of the details of this month&apos;s challenge,{' '}
					<Link href="/monthlychallenges/may-2024">
						check out the May 2024 challenge page
					</Link>
					.
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/monthly-challenge-cultivating-community-kindness-in-uncertain-times-7n">
						this blog post
					</a>
					.
				</p>
			</>
		),
		links: [
			{
				href: '/monthlychallenges/may-2022',
				title: 'May, 2022',
			},
			{
				href: '/monthlychallenges/apr-2021',
				title: 'April, 2021',
			},
		],
	},
	{
		title: 'Creating Audio/Visual content',
		subtitle: `Create a community of knowledge sharing and access to learning with AV content.`,
		description: (
			<p>
				For this challenge, members present their knowledge and showcase their
				understanding by exploring video and audio mediums for sharing
				knowledge, highlighting their achievements. They might do that by giving
				Lunch & Learns, YouTube videos, podcasts, or some other form of audio or
				video content they created that explores a coding-related concept
				&mdash; there&apos;s no length requirement. We believe this provides
				value by solidifying ideas, creating a resource for others, inviting
				personal growth through conversations sparked by sharing, and
				demonstrating your ability to talk through a concept.
			</p>
		),
		links: [
			{
				href: '/monthlychallenges/mar-2022',
				title: 'March, 2022',
			},
			{
				href: '/monthlychallenges/feb-2021',
				title: 'February, 2021',
			},
		],
	},
	{
		title: 'Pairing',
		subtitle: `Pairing is more than just coding with someone else. Pairing is about communication, teaching, learning, positive reinforcements, and growing.`,
		renderDescription: (challengeData: unknown) => {
			let totalSessions: number = 0;
			if (typeof challengeData === 'number') {
				totalSessions = challengeData;
			}
			return (
				<>
					<p>
						For this community challenge, we&apos;re trying to hit 30 pairing
						sessions by the end of the month. Some ways to get started pairing
						are by working on an open-source issue, a LeetCode problem, or a
						project you need help on. Check out{' '}
						<a href="https://dev.to/virtualcoffee/the-power-of-pair-programming-benefits-types-and-tips-1h4c">
							The Power of Pair Programming: Benefits, Types, and Tips
						</a>{' '}
						for more on why you should pair up with us this May!
					</p>
					<p>
						This challenge is sponsored by{' '}
						<a href="https://tuple.app/">Tuple</a>, the remote pair programming
						app on macOS and Linux.
					</p>
					<h3 className="display-3">
						Current status: {totalSessions.toLocaleString()} out of 50 pairing
						sessions
					</h3>

					<div className="progress my-4" style={{ height: '3em' }}>
						<div
							className="progress-bar progress-bar progress-bar-striped"
							role="progressbar"
							style={{ width: `${(totalSessions / 50) * 100}%` }}
							aria-valuenow={totalSessions}
							aria-valuemin={0}
							aria-valuemax={50}
						>
							{totalSessions.toLocaleString()} Pairing Sessions
						</div>
					</div>
				</>
			);
		},
		links: [
			{
				href: '/monthlychallenges/feb-2022',
				title: 'February, 2022',
			},
			{
				href: '/monthlychallenges/dec-2020',
				title: 'December, 2020',
			},
		],
		loaderData: async (): Promise<number> => {
			const allPairingSesions = await getTotalPairingSessions();
			return allPairingSesions;
		},
	},
	{
		title: 'Month of Feedback',
		subtitle: `Giving and accepting meaningful and empathetic feedback.`,
		description: (
			<p>
				When we care about our community members, we can offer empathetic
				responses that are honest and allow them to grow and to fix a problem.
				Sometimes these conversations are hard. But sometimes we need hard
				conversations to help us grow. This challenge calls members to approach
				each other with kindness and honesty, and allow this kind of feedback to
				be a regular part of our process.
			</p>
		),
		links: [
			{
				href: '/monthlychallenges/june-2022',
				title: 'June, 2022',
			},

			{
				href: '/monthlychallenges/may-2021',
				title: 'May, 2021',
			},
		],
	},
	{
		title: 'Mid-Year Check-In',
		subtitle: `Reflect. Reevaluate. Grow.`,
		description: (
			<>
				<p>
					The Mid-Year Check-In challenge is designed to provide an opportunity
					for Virtual Coffee members to reflect on their progress, reevaluate
					goals, and gain clarity on their journey. Let’s pause, assess, and
					adjust as we reach the halfway point of the year. This challenge aims
					to encourage personal growth, foster connection within the community,
					and provide a supportive space for members to share their insights,
					challenges, and successes.
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/monthly-challenge-mid-year-check-in-recharge-and-refocus-for-an-amazing-second-half-2k4c?preview=a791f8dd07aff349a398a7756c6099c120b0d09b0d0bcad1aa41e59d64b306292ca5bd66febb03a0fc42c3d4d650c1abe5c1f20f3c9252a7a80773ec">
						this blog post
					</a>
					.
				</p>
				<p>
					To view all of the details of this year&apos;s challenge,{' '}
					<Link href="/monthlychallenges/june-2024">
						check out the June 2024 challenge page
					</Link>
					.
				</p>
			</>
		),
	},
	{
		title: 'New Year, New Goal',
		subtitle: `The new year offers an opportunity for a fresh start and a chance to set a new goal.`,
		description: (
			<>
				<p>
					In this challenge, we encourage you to setting up an ambitious goal
					for the year and break it into achievable goals for each month. Our
					Coffee Table Groups are participating in this challenge and ready to
					support you!
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/join-virtual-coffee-in-new-year-new-goal-setting-one-big-goal-and-achieving-it-30c5">
						this blog post
					</a>
					.
				</p>
				<p>
					To view all of the details of this year&apos;s challenge,{' '}
					<Link href="/monthlychallenges/jan-2025">
						check out the January 2025 challenge page
					</Link>
					.
				</p>
			</>
		),
		links: [
			{
				href: '/monthlychallenges/jan-2024',
				title: 'January, 2024',
			},
		],
	},
	{
		title: 'Welcoming Community',
		subtitle: `Let's bring new friends in and give them a warm welcome!`,
		description: (
			<>
				<p>
					This challenge allows you to invite a friend to join our community.
					However, simply inviting someone is not enough! We encourage you to
					warmly welcome and support our new friends and demonstrate what
					Virtual Coffee is truly all about - a welcoming and supportive
					community!
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/monthly-challenge-welcoming-community-4d44">
						this blog post
					</a>
					.
				</p>
				<p>
					To view all of the details of this year&apos;s challenge,{' '}
					<Link href="/monthlychallenges/july-2024">
						check out the July 2024 challenge page
					</Link>
					.
				</p>
			</>
		),
	},
	{
		title: 'Photography Challenge',
		subtitle: `Let's get out and about!`,
		description: (
			<>
				<p>
					As programmers, we spend all day in front of the screen. At Virtual
					Coffee, we also value health and wellbeing. The motivation behind our
					August challenge is to get folks out and about and seeing the world.
					We will be encouraging our members to make the most of summer (in the
					Northern hemisphere, at least), enjoy some work / life balance and
					benefit from the fresh air and exercise of the great outdoors. The
					challenge <em>could</em> be completed without ever leaving the car,
					but to get the most out of it, leave the car for a bit and get some
					real fresh air and exercise. A little hint for those of you that have
					access to public transportation: Public transportation is a great way
					to see the world while someone else does the driving. It also forces
					you to actually get some exercise because it probably won&apos;t pick
					you up at your front door.
				</p>
				{/* <p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/monthly-challenge-photography-4g18">
						this blog post
					</a>
					.
				</p> */}
				<p>
					To view all of the details of this year&apos;s challenge,{' '}
					<Link href="/monthlychallenges/aug-2025">
						check out the August 2025 challenge page
					</Link>
					.
				</p>
			</>
		),
		links: [
			{
				href: '/monthlychallenges/aug-2024',
				title: 'August, 2024',
			},
		],
	},
	{
		title: 'Spring 2025 Quarter Challenge: From Idea to Stage',
		subtitle: `Let's brainstorm those ideas, submit that CFP, and bring them to the stage!`,
		description: (
			<>
				<p>
					Over the next three months, we'll work together to bring our internal
					conference to life, creating opportunities for both speakers and event
					organizers.
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/finding-your-voice-why-speaking-matters-in-tech-439a">
						this blog post
					</a>
					.
				</p>
				<p>
					To view all of the details of this year&apos;s challenge,{' '}
					<Link href="/monthlychallenges/spring-2025">
						check out the Spring 2025 Quarter Challenge page
					</Link>
					.
				</p>
			</>
		),
	},
	{
		title: 'Goals Check-In',
		subtitle: `Reflect. Reevaluate. Adjust.`,
		description: (
			<>
				<p>
					The Goals Check-In challenge provides an opportunity for Virtual
					Coffee members to reflect on their progress, reevaluate the achievable
					monthly goals, and gain clarity on their journey to achieve the big
					goal they set at the beginning of the year. Let’s pause, assess, and
					adjust those monthly goals if necessary. This challenge aims to
					encourage personal growth, foster connection within the community, and
					provide a supportive space for members to share their insights,
					challenges, and successes.
				</p>
				<p>
					Learn more about this challenge in{' '}
					<a href="https://dev.to/virtualcoffee/goals-check-in-hows-your-progress-flowing-2a45">
						this blog post
					</a>
					.
				</p>
				<p>
					To view all of the details of this year&apos;s challenge,{' '}
					<Link href="/monthlychallenges/may-2025">
						check out the May 2025 challenge page
					</Link>
					.
				</p>
			</>
		),
	},
];

const currentItem = challengeList.find((item) => item.current);

const filteredChallenges = currentItem
	? [currentItem, ...challengeList.filter((item) => !item.current)]
	: challengeList;

function ChallengeItem({
	challenge,
	challengeData,
}: {
	challenge: Challenge;
	challengeData: unknown;
}) {
	return (
		<>
			<dt className={challenge.current ? 'gridlist-current' : undefined}>
				{challenge.current && (
					<small className="d-block text-muted">Current Challenge: </small>
				)}{' '}
				{challenge.title}
			</dt>
			<dd className={challenge.current ? 'gridlist-current' : undefined}>
				<p className="gridlist-subtitle">{challenge.subtitle}</p>
				{challenge.description}
				{challenge.current &&
					challenge.renderDescription &&
					challenge.renderDescription(challengeData)}
				{challenge.links && challenge.links.length > 0 && (
					<>
						<h3>Resources and results from past challenges:</h3>
						<ul>
							{challenge.links.map((link) => (
								<li key={link.href}>
									<a href={link.href}>{link.title}</a>
								</li>
							))}
						</ul>
					</>
				)}
			</dd>
		</>
	);
}

export default async function Index() {
	let currentChallengeData = null;

	if (currentItem?.loaderData) {
		currentChallengeData = await currentItem.loaderData();
	}

	return (
		<DefaultLayout
			Hero="UndrawGoodTeam"
			heroHeader={metadata.title as string}
			heroSubheader={metadata.description as string}
		>
			<div>
				<div className="bg-white py-3">
					<div className="container">
						<h2>What are monthly challenges?</h2>

						<p>
							These monthly challenges provide members the opportunity to learn,
							grow, and receive support and mentorship. There will be a theme
							for each month&apos;s challenge and weekly goals for the members
							to work on. Instructions, resources, and additional help for the
							challenges is provided in the <code>#monthly-challenge</code>{' '}
							channel in Slack. Along with our Maintainers, our Challenge Team
							Leads plan, organize, and facilitate these challenges.
						</p>

						<h2>Who can participate?</h2>

						<p>
							These challenges are available to all Virtual Coffee members. The
							goal is to support developers of all stages in their coding
							journey To become a member of Virtual Coffee, all you need to do
							is{' '}
							<Link href="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/what-to-expect-in-virtual-coffee#coffees-virtual-coffee-weekly-zoom-chats">
								attend a Tuesday or Thursday Coffee
							</Link>{' '}
							and submit the form you&apos;ll receive at Coffee. After you
							submit the form, you will receive an invitation to join the Slack
							group, where you can share your progress on the challenges and ask
							questions.
						</p>
					</div>
				</div>

				<div className="bg-light py-5">
					<div className="container">
						<h2 className="display-5">Our challenges:</h2>
						<dl className="gridlist mt-4">
							{filteredChallenges.map((challenge) => (
								<ChallengeItem
									key={challenge.title}
									challenge={challenge}
									challengeData={currentChallengeData}
								/>
							))}
						</dl>
					</div>
				</div>
			</div>
		</DefaultLayout>
	);
}
