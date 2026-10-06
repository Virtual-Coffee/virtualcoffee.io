import { getChallengeData } from '@/data/monthlyChallenges/oct-2022';

export default function HacktoberfestRepos() {
	const repos = getChallengeData();

	return (
		<>
			<h2>Virtual Coffee Approved Repositories!</h2>
			<ul className="list-unstyled">
				{repos.map((repo, i) => (
					<li key={i}>
						<h3>
							<a href={repo.RepoUrl}>{repo.RepoName}</a>
						</h3>
						<p>{repo.Description}</p>
						<p>
							<strong>Maintainer</strong>: {repo.Maintainer}
						</p>
					</li>
				))}
			</ul>
		</>
	);
}
