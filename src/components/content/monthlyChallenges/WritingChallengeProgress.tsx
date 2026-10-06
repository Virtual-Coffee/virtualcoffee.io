import { Fragment } from 'react';
import {
	getWritingChallengeData,
	type WritingChallengeYear,
} from '@/data/monthlyChallenges/NaNoWriMo';

type WritingChallengeProgressProps = {
	year: WritingChallengeYear;
};

export default function WritingChallengeProgress({
	year,
}: WritingChallengeProgressProps) {
	const { sortedList, totals, completedGoals, currentGoal } =
		getWritingChallengeData(year);

	if (totals.totalPosts === 0) {
		return null;
	}

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
								{goal.title} goal completed!!!
							</li>
						))}
					</ul>

					<div className="h3">
						Stretch Goal {completedGoals.length}:{' '}
						{totals.totalCount.toLocaleString()} out of{' '}
						{currentGoal?.value.toLocaleString()} words
					</div>
				</>
			) : (
				<h2>
					Current status: {totals.totalCount.toLocaleString()} out of{' '}
					{currentGoal?.title} words
				</h2>
			)}

			<div className="progress my-4" style={{ height: '3em' }}>
				<div
					className="progress-bar progress-bar progress-bar-striped"
					role="progressbar"
					style={{
						width: `${(totals.totalCount / (currentGoal?.value || 1)) * 100}%`,
					}}
					aria-valuenow={totals.totalCount}
					aria-valuemin={0}
					aria-valuemax={currentGoal?.value}
				>
					{totals.totalCount.toLocaleString()} Words
				</div>
			</div>

			<h2 className="mt-5">Our Posts:</h2>

			{sortedList.map((author, i) => (
				<Fragment key={i}>
					<div className="header-anchor-wrapper header-anchor-wrapper-h3">
						<h3 id={`${author.slug}`} tabIndex={-1}>
							{author.name}
						</h3>
						<a className="header-anchor" href={`#${author.slug}`}>
							<span className="visually-hidden">
								Permalink to {author.name}'s posts
							</span>
							<span aria-hidden="true">#</span>
						</a>
					</div>

					<ul>
						{author.posts.map((post, j) => (
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
					{totals.list.map((author, i) => (
						<tr key={i}>
							<td>{author.name}</td>
							<td className="text-end">{author.posts.toLocaleString()}</td>
							<td className="text-end">{author.total.toLocaleString()}</td>
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
