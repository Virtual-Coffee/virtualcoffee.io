import { json, useLoaderData } from 'remix';
import PostList from '~/components/PostList';
import getChallenges from '~/data/monthlyChallenges/getChallenges';

export async function loader() {
	const challenges = await getChallenges();
	return json({ challenges });
}

export const handle = {
	meta: {
		title: 'Virtual Coffee Monthly Challenges',
		description:
			'Every month, we create a challenge for our Virtual Coffee members to complete together',
	},
	hero: {
		Hero: 'UndrawGoodTeam',
	},
};

export function meta() {
	return handle.meta;
}

export default function Index() {
	const { challenges } = useLoaderData();
	return (
		<div>
			<div className="bg-light py-3">
				<div className="container-xl">
					<h2 className="display-5">
						Why should members participate in the monthly challenge?
					</h2>

					<p>
						These monthly challenges provide members the opportunity to learn,
						grow, and receive support and mentorship. There will be a theme for
						each month's challenge and weekly goals for the members to work on.
						Instructions, resources, and additional help for the challenges is
						provided in the #monthly-challenge channel in slack. Along with our
						Maintainers, our Challenge Team Leads plan, organize, and facilitate
						these challenges.
					</p>
				</div>
			</div>

			<div className="bg-light py-3">
				<div className="container-xl">
					<h2 className="display-5">Who can participate?</h2>

					<p>
						These challenges are available to all Virtual Coffee members and the
						goal is to support developers of all stages in their coding journey.
						To become a member of Virtual Coffee, all you need to do is{' '}
						<a href="/events">attend a Tuesday or Thursday Coffee</a> and submit
						the form you'll receive at coffee. After you submit the form, you
						will receive an invitation to join the slack group where you can
						share your progress on the challenges and ask questions.
					</p>
				</div>
			</div>

			<div className="bg-light py-5">
				<div className="container-xl">
					<h2 className="display-5">Our challenges so far:</h2>
					<PostList items={challenges} />

					{/* {% displayPostList collections.monthlychallenges | reverse %} */}
				</div>
			</div>
		</div>
	);
}
