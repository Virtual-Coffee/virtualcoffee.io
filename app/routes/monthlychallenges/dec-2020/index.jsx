import { json, useLoaderData } from 'remix';
import challengeJson from './dec-2020.json';

export const handle = {
	listTitle: 'December, 2020: Pairing!',
	meta: {
		title: 'Monthly Theme & Challenge for December, 2020: Pairing!',
		description:
			'December challenge -> Pair up and complete five pomodoro sessions with other community members.',
	},
	date: '2020-12-01',
	hero: {
		heroHeader: '',
	},
};

export const meta = () => {
	return handle.meta;
};

export function loader() {
	const { challengedata } = challengeJson;

	let totals = {};

	challengedata.forEach((challenge, i) => {
		challenge.participants.forEach((p) => {
			if (p in totals) {
				totals[p] = totals[p] + 1;
			} else {
				totals[p] = 1;
			}
		});
	});

	return json({
		list: challengedata,
		totals,
	});
}

export default function Challenge() {
	const { list, totals } = useLoaderData();
	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <a href="/monthlychallenges/">next challenge</a>!
			</div>

			<h1>
				<small>Monthly Challenge for December, 2020:</small> Pairing!
			</h1>

			<p className="lead">
				Pairing is more than just coding with someone else. Pairing is about
				communication, teaching, learning, positive reinforcements, and growing.
			</p>

			<p className="lead">
				This month, let’s work together to build on these skills. For this
				challenge, let’s try to hit 5 pairing sessions per person, limiting your
				pairing sessions to one Pomodoro session--twenty-five minutes--unless
				you have made arrangements with your partner. When you’ve finished one
				of your sessions, report back to the #monthly-challenge channel in slack
				and let us know how you did and what you worked on! We’ll track how many
				pomodoro sessions we hit. Before you start, take a look at Martin
				Fowler’s article{' '}
				<a
					href="https://martinfowler.com/articles/on-pair-programming.html"
					target="_blank"
					rel="noopener noreferrer"
				>
					On Pair Programming
				</a>
				.
			</p>

			<table className="table mt-5" style={{ maxWidth: '600px' }}>
				<thead className="thead-dark">
					<tr>
						<th scope="col">Pairing topic</th>
						<th scope="col" className="text-right">
							Members
						</th>
					</tr>
				</thead>
				<tbody>
					{list.map((challenge, i) => (
						<tr key={i}>
							<td>{challenge.theme}</td>
							<td className="text-right">
								{challenge.participants.join(', ')}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<hr />

			<h4 className="mt-5">Overview</h4>
			<table className="table" style={{ maxWidth: '600px' }}>
				<thead>
					<tr>
						<th scope="col">Member</th>
						<th scope="col" className="text-right">
							Number of pairing sessions
						</th>
					</tr>
				</thead>
				<tbody>
					{Object.keys(totals).map((person, i) => {
						const num = totals[person];
						return (
							<tr key={i}>
								<td>{person}</td>
								<td className="text-right">
									{num} event{num > 1 ? 's' : ''}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</>
	);
}
