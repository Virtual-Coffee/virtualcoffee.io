import { Fragment } from 'react';
import challengeJson from '@/data/monthlyChallenges/data/nov-2020.json';

export default function Nov2020Posts() {
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
				<thead className="table-dark">
					<tr>
						<th scope="col">Member Totals</th>
						<th scope="col" className="text-end">
							Posts
						</th>
						<th scope="col" className="text-end">
							Total Words
						</th>
					</tr>
				</thead>
				<tbody>
					{totals.list.map((person, i) => (
						<tr key={i}>
							<td>{person.name}</td>
							<td className="text-end">{person.posts.toLocaleString()}</td>
							<td className="text-end">{person.total.toLocaleString()}</td>
						</tr>
					))}
				</tbody>
				<tfoot>
					<tr>
						<th scope="col">Total</th>
						<th scope="col" className="text-end">
							{totals.totalPosts.toLocaleString()}
						</th>
						<th scope="col" className="text-end">
							{totals.totalCount.toLocaleString()} words
						</th>
					</tr>
				</tfoot>
			</table>
		</>
	);
}
