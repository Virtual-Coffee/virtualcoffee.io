import { Fragment } from 'react';
import slugify from '@sindresorhus/slugify';
import { HeroHead } from '@/components/layouts/DefaultLayout';
import data from '@/data/monthlyChallenges/data/nov-2022.json';

type NovemberChallengeEntryAuthor = {
	id: string | number;
	fullName?: string | null;
	userYourName?: string | null;
};

type NovemberChallengeEntry = {
	title: string;
	shortDescriptionMarkDown?: string | null;
	id?: number | string;
	urlValue: string;
	wordCount: number;
	topics?: string | null;
	date: string;
	author: NovemberChallengeEntryAuthor;
};

const goals = [
	{
		title: '100k',
		value: 100000,
	},
	{
		title: '150k',
		value: 150000,
	},
	{
		title: '200k',
		value: 200000,
	},
	{
		title: '250k',
		value: 250000,
	},
	{
		title: '300k',
		value: 300000,
	},
	{
		title: '350k',
		value: 350000,
	},
	{
		title: '400k',
		value: 400000,
	},
];

function getProgress() {
	const posts: NovemberChallengeEntry[] = data;

	let totalWordCount = 0;

	let totalPosts = 0;

	const authorsWithPosts: (NovemberChallengeEntryAuthor & {
		slug: string;
		totalPosts: number;
		totalWordCount: number;
		posts: NovemberChallengeEntry[];
	})[] = [];

	posts.forEach((post) => {
		const author = authorsWithPosts.find(
			(author) => author.id === post.author.id,
		);
		if (!author) {
			authorsWithPosts.push({
				...post.author,
				slug: slugify(post.author.userYourName || post.author.fullName || ''),
				totalPosts: 1,
				totalWordCount: post.wordCount,
				posts: [post],
			});
		} else {
			author.totalPosts++;
			author.totalWordCount += post.wordCount;
			author.posts.push(post);
		}

		totalWordCount += post.wordCount;
		totalPosts++;
	});

	const currentGoal = goals.find((goal) => goal.value > totalWordCount);
	const completedGoals = goals.filter((goal) => goal.value <= totalWordCount);

	return {
		totalWordCount,
		totalPosts,
		authorsWithPosts,
		currentGoal,
		completedGoals,
	};
}

/** The page's banner: its title over the running word count. */
export function Nov2022Status({ title }: { title: string }) {
	const { totalWordCount, currentGoal } = getProgress();

	return (
		<HeroHead
			heroHeader={title}
			heroSubheader={`Current status: ${totalWordCount.toLocaleString()} out of ${currentGoal?.title} words`}
		/>
	);
}

export default function Nov2022Posts() {
	const {
		totalWordCount,
		totalPosts,
		authorsWithPosts,
		currentGoal,
		completedGoals,
	} = getProgress();

	if (totalPosts === 0) {
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
						{totalWordCount.toLocaleString()} out of{' '}
						{currentGoal?.value.toLocaleString()} words
					</div>
				</>
			) : (
				<h2>
					Current status: {totalWordCount.toLocaleString()} out of{' '}
					{currentGoal?.title} words
				</h2>
			)}

			<div className="progress my-4" style={{ height: '3em' }}>
				<div
					className="progress-bar progress-bar progress-bar-striped"
					role="progressbar"
					style={{
						width: `${(totalWordCount / (currentGoal?.value || 1)) * 100}%`,
					}}
					aria-valuenow={totalWordCount}
					aria-valuemin={0}
					aria-valuemax={currentGoal?.value}
				>
					{totalWordCount.toLocaleString()} Words
				</div>
			</div>

			<h2 className="mt-5">Our Posts:</h2>

			{authorsWithPosts.map((author, i) => (
				<Fragment key={i}>
					<div className="header-anchor-wrapper header-anchor-wrapper-h3">
						<h3 id={`${author.id}`} tabIndex={-1}>
							{author.userYourName || author.fullName}
						</h3>
						<a className="header-anchor" href={`#${author.slug}`}>
							<span className="visually-hidden">
								Permalink to {author.userYourName || author.fullName}'s posts
							</span>
							<span aria-hidden="true">#</span>
						</a>
					</div>

					<ul>
						{author.posts.map((post, j) => (
							<li key={j}>
								<a href={post.urlValue}>{post.title}</a>
								<code>({post.wordCount.toLocaleString()} words)</code>
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
					{authorsWithPosts.map((author, i) => (
						<tr key={i}>
							<td>{author.userYourName || author.fullName}</td>
							<td className="text-end">{author.totalPosts.toLocaleString()}</td>
							<td className="text-end">
								{author.totalWordCount.toLocaleString()}
							</td>
						</tr>
					))}
				</tbody>
				<tfoot>
					<tr>
						<th scope="col">Total</th>
						<th scope="col" className="text-end">
							{totalPosts.toLocaleString()}
						</th>
						<th scope="col" className="text-end">
							{totalWordCount.toLocaleString()} words
						</th>
					</tr>
				</tfoot>
			</table>
		</>
	);
}
