import Link from 'next/link';

const handle = {
	listTitle: 'November 2025: Creative Community Challenge',
	meta: {
		title: 'Monthly Challenge for November 2024: Creative Community Challenge',
		description:
			"November challenge -> Let's make some space for the other parts of ourselves.",
	},
	date: '2025-11-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <Link href="/monthlychallenges/dec-2025">next challenge</Link>!
			</div>

			<h1>
				<small>Monthly Challenge for November 2025:</small> Creative Community
				Challenge
			</h1>

			<p className="lead text-center mt-5">
				Let's make some space for the other parts of ourselves.
			</p>

			<h2 className="mt-5 mb-4">The Challenge</h2>
			<p>
				Devs are more than just the code we write. This month is all about
				embracing self-expression. Give back to yourself by indulging in
				something just for fun. Share the art, music, poetry, sports, games, or
				other hobbies that spark your joy. We spend so much time grinding away
				on understanding things in the tech space.{' '}
				<em>Let's make some space for the other parts of ourselves</em>.
			</p>
			<p>
				We're encouraging you to spend time this month working on things that
				aren't necessarily code-specific or using code to improve other hobbies
				and outlets. Let the rest of VC know what you've got going on. You don't
				have to share your work, but we'd love to see and celebrate your
				achievements. It can also be a great time to explore new hobbies and
				activities. If someone is doing something you're interested in, this is
				the month to learn more and give it a try.
			</p>

			<h2 className="mt-5 mb-4">
				Blogging Track: Continuing the November Tradition
			</h2>
			<p>
				For those who used to participate in our November Blogging Challenge,
				we're making sure that blogging remains a key component of this year's
				creative focus!
			</p>
			<p>
				You can choose to make blogging (either non-tech or tech-related) your
				primary creative activity this month. Whether you're writing a novel,
				starting a new blog, or just publishing a single post, we encourage you
				to use the resources and community support to achieve your writing
				goals. This specific track allows you to continue the tradition of
				prioritizing content creation during November as part of the broader
				Creative Community Challenge.
			</p>

			<h2 className="mt-5 mb-4">How to Participate</h2>
			<ul>
				<li>
					Pick one or two creative activities you want to focus on and talk
					about this month. If you need activity inspiration, check out the{' '}
					<code>#making-stuff</code> channel on Slack.
				</li>
				<li>
					If you want to share your blog post, either non-tech or tech-related,
					drop it at <code>#content-creation</code> channel on Slack.
				</li>
				<li>
					Use the VC <code>#monthly-challenge</code> channel to post any
					questions, content, or kudos surrounding your hobbies and passions.
				</li>
				<li>
					Tag <a href="https://twitter.com/VirtualCoffeeIO">@VirtualCoffeeIO</a>{' '}
					on social media.
				</li>
				<li>
					X posts, blog posts, and pictures are all welcome as long as they
					abide by our{' '}
					<a href="https://virtualcoffee.io/code-of-conduct/">
						Code of Conduct
					</a>
					.
				</li>
			</ul>

			<hr />

			<p>
				As always, you can reach out to the maintainers or monthly challenge
				facilitators if you have any questions.
			</p>
			<p>
				We also do weekly check ins in the <code>#monthly-challenge</code>{' '}
				channel on Slack to track your activities progress and to celebrate with
				you! 🩵
			</p>
		</>
	);
}
