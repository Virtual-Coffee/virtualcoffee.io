import rows from './data/hacktoberfest-2022-repos.json';

/**
 * Repos that took part in the October 2022 Hacktoberfest challenge, frozen as a
 * snapshot, docs/adr/0004.
 */

export type HacktoberfestRepo = {
	RepoName: string;
	RepoUrl: string;
	Description: string;
	Maintainer: string;
};

export function getChallengeData(): HacktoberfestRepo[] {
	return rows as HacktoberfestRepo[];
}
