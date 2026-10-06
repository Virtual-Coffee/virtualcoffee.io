import { Fragment } from 'react';
import { getChallengeData } from '@/data/monthlyChallenges/nov-2021';

export default function Nov2021Posts() {
	const { completedGoals, currentGoal, sortedList, totals } =
		getChallengeData();

	return (
		<>
			{completedGoals.length ? (
				<>
					<h2>
						<small>Current status:</small>
					</h2>

					<ul>
						{completedGoals.map((goal, i) => (
							<li key={i} className="lead">
								{goal.toLocaleString()} goal completed!!!
							</li>
						))}
					</ul>

					<div className="h3">
						Stretch Goal {completedGoals.length}:{' '}
						{totals.totalCount.toLocaleString()} out of{' '}
						{currentGoal.toLocaleString()} words
					</div>
				</>
			) : (
				<h2>
					Current status: {totals.totalCount.toLocaleString()} out of{' '}
					{currentGoal.toLocaleString()} words
				</h2>
			)}

			<div className="progress my-4" style={{ height: '3em' }}>
				<div
					className="progress-bar progress-bar progress-bar-striped"
					role="progressbar"
					style={{ width: `${(totals.totalCount / currentGoal) * 100}%` }}
					aria-valuenow={totals.totalCount}
					aria-valuemin={0}
					aria-valuemax={currentGoal}
				>
					{totals.totalCount.toLocaleString()} Words
				</div>
			</div>

			<h2 className="mt-5">Our Posts:</h2>

			{sortedList.map((person, i) => (
				<Fragment key={i}>
					<div className="header-anchor-wrapper header-anchor-wrapper-h3">
						<h3 id={person.slug} tabIndex={-1}>
							{person.name}
						</h3>
						<a className="header-anchor" href={`#${person.slug}`}>
							<span className="visually-hidden">
								Permalink to {person.name}'s posts
							</span>
							<span aria-hidden="true">#</span>
						</a>
					</div>

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
