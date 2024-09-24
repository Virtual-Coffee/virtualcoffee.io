import { createMetaData } from '@/util/createMetaData.server';
import Link from 'next/link';

export const handle = {
	listTitle: 'December 2023: Creative Community Challenge',
	meta: {
		title: 'Monthly Challenge for December 2023: Creative Community Challenge',
		description:
			"December challenge -> Let's make some space for the other parts of ourselves.",
	},
	date: '2023-12-01',
	hero: {
		heroHeader: '',
	},
};

export async function loader() {
	const { title, description } = handle.meta;
	return json({
		meta: createMetaData({ title, description }),
	});
}

export const meta = handle.meta;

export default function Challenge() {
	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <Link href="/monthlychallenges/jan-2024">next challenge</Link>!
			</div>

			<h1>
				<small>Monthly Challenge for December, 2023:</small> Creative Community
				Challenge
			</h1>

			<p className="lead text-center mt-3">
				Let's make some space for the other parts of ourselves.
			</p>

			<h2 className="mt-5">The Challenge</h2>
			<p>
				Devs are more than just the code we write. This month is all about
				embracing self-expression. Give back to yourself by indulging in
				something just for fun. Share the art, music, poetry, sports, games, or
				other hobbies that spark your joy. We spend so much time grinding away
				on understanding things in the tech space.{' '}
				<em>Let's make some space for the other parts of ourselves</em>.
			</p>
			<p>
				We're encouraging folks to spend time this month working on things that
				aren't necessarily code-specific or using code to improve other hobbies
				and outlets. Let the rest of VC know what you've got going on. You don't
				have to share your work, but we'd love to see and celebrate your
				achievements. It can also be a great time to explore new hobbies and
				activities. If someone is doing something you're interested in, this is
				the month to learn more and give it a try.
			</p>

			<h2>How to Participate</h2>
			<ul>
				<li>
					Pick one or two creative activities you want to focus on and talk
					about this month.
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
					Tweets, blog posts, and pictures are all welcome as long as they abide
					by our{' '}
					<a href="https://virtualcoffee.io/code-of-conduct/">
						Code of Conduct
					</a>
					.
				</li>
				<li>
					As always, you can reach out to the maintainers or monthly challenge
					facilitators if you have any questions.
				</li>
				<li>
					We'll have opportunities for folks to check in and give updates on how
					their activities are progressing.
				</li>
			</ul>
		</>
	);
}
