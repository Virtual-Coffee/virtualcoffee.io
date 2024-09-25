import challengeJson from './nov-2020.json';
import { Fragment } from 'react';

export const handle = {
	listTitle: 'November, 2020: 50k words!',
	meta: {
		title: 'Monthly Theme & Challenge for November, 2020: 50k words!',
		description:
			'November challenge -> Blogging: we all work together to hit 50,000 words.',
	},
	date: '2020-11-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	const { challengedata } = challengeJson;

	const totalsList: {
		name: string;
		posts: number;
		total: number;
	}[] = [];
	let totalCount = 0;
	let totalPosts = 0;

	challengedata.forEach(function (person) {
		const p = {
			name: person.name,
			posts: person.posts.length,
			total: person.posts.reduce((total, post) => total + post.count, 0),
		};

		totalCount = totalCount + p.total;
		totalPosts = totalPosts + p.posts;
		totalsList.push(p);
	});

	const sortedList = challengedata.sort((a, b) => a.name.localeCompare(b.name));
	const totals = {
		list: totalsList.sort((a, b) => b.total - a.total),
		totalCount,
		totalPosts,
	};

	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the
				<a href="/monthlychallenges/">next challenge</a>!
			</div>

			<h1>
				<small>Monthly Challenge for November, 2020:</small> 50k words!
			</h1>

			<p className="lead">
				The Virtual Coffee Monthly Challenge for November 2020 -&gt; Blogging!
				We all work together to hit 50,000 words. Based off the NanWriMo
				(National Novel Writing Month) Challenge, but working together towards
				the goal while posting on our own blogs.
			</p>

			<p className="lead">Get those blog posts up!</p>

			<h2>
				Current status: {totals.totalCount.toLocaleString()} out of 50,000 words
			</h2>

			<div className="progress my-4" style={{ height: '3em' }}>
				<div
					className="progress-bar progress-bar progress-bar-striped"
					role="progressbar"
					style={{ width: `${(totals.totalCount / 50000) * 100}%` }}
					aria-valuenow={totals.totalCount}
					aria-valuemin={0}
					aria-valuemax={50000}
				>
					{totals.totalCount.toLocaleString()} Words
				</div>
			</div>

			<h2 className="mt-5">Our Posts:</h2>

			{sortedList.map((person, i) => (
				<Fragment key={i}>
					<h3>
						<a href={person.blogLink}>{person.name}</a>
					</h3>
					<ul>
						{person.posts.map((post, j) => (
							<li key={j}>
								<a href={post.url}>{post.title}</a>
								<code>({post.count.toLocaleString()} words)</code>
							</li>
						))}
					</ul>
				</Fragment>
			))}

			<h2 className="mt-5">Totals:</h2>

			<table className="table mt-5" style={{ maxWidth: '600px' }}>
				<thead className="thead-dark">
					<tr>
						<th scope="col">Member Totals</th>
						<th scope="col" className="text-right">
							Posts
						</th>
						<th scope="col" className="text-right">
							Total Words
						</th>
					</tr>
				</thead>
				<tbody>
					{totals.list.map((person, i) => (
						<tr key={i}>
							<td>{person.name}</td>
							<td className="text-right">{person.posts.toLocaleString()}</td>
							<td className="text-right">{person.total.toLocaleString()}</td>
						</tr>
					))}
				</tbody>
				<tfoot>
					<tr>
						<th scope="col">Total</th>
						<th scope="col" className="text-right">
							{totals.totalPosts.toLocaleString()}
						</th>
						<th scope="col" className="text-right">
							{totals.totalCount.toLocaleString()} words
						</th>
					</tr>
				</tfoot>
			</table>
		</>
	);
}
