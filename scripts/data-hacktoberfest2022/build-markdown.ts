import fs from 'fs';
import { join } from 'path';
import contributors from '../../app/_generatedData/hacktoberfest2022/contributors.json';

// const contributors = JSON.parse(fs.readFileSync(join(
//   process.cwd(),
//   'app',
//   '_generatedData',
//   'hacktoberfest2022',
//   'contributors.json',
// ), 'utf8'));

// const maintainers = JSON.parse(fs.readFileSync(join(
//   process.cwd(),
//   'app',
//   '_generatedData',
//   'hacktoberfest2022',
//   'contributors.json',
// ), 'utf8'));

const markdown = contributors.contributions
	.filter((contribution) => contribution.stats.totalPullRequests > 0)
	.map((contribution) => {
		let str = `
### [${contribution.login}](https://github.com/${contribution.login})
- Total pull requests: **${contribution.stats.totalPullRequests}**
- Total changed files: **${contribution.stats.totalChangedFiles}**
- Total additions: **${contribution.stats.totalAdditions}**
- Total deletions: **${contribution.stats.totalDeletions}**
- Unique repos: **${contribution.stats.totalUniqueRepos}**
${contribution.stats.uniqueRepos
	.map((repo) => {
		return `- **[${repo}](https://github.com/${repo})**
${contribution.pullRequests
	.filter((pr) => pr.baseRepository.nameWithOwner === repo)
	.map((pr) => {
		return `  - [${pr.title}](${pr.url}) - ${pr.changedFiles} files changed
`;
	})
	.join('')}`;
	})
	.join('')}`;

		return str;
	})
	.join('');

fs.writeFileSync(
	join(
		process.cwd(),
		'app',
		'_generatedData',
		'hacktoberfest2022',
		'contributors.md',
	),
	markdown,
);
