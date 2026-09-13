import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import Airtable from 'airtable';

/**
 * One-off snapshot of the monthly challenge data out of Airtable.
 *
 * Every challenge this reads is finished — the newest entry is from November
 * 2024 — so the data is frozen and there is nothing to keep in sync. Committing
 * it as JSON follows the same reasoning as `src/data/podcast/episodes.json`:
 * the pages become genuinely static, a build no longer depends on Airtable
 * being reachable, and `PUBLIC_AIRTABLE_API_KEY` stops being needed at all.
 *
 * Kept in the repo for provenance rather than because it needs re-running. It
 * reads through the same views the old fetches used, so the snapshot contains
 * exactly the rows the site used to render — a view can filter out rows that a
 * plain table read would include, and the 2023 and 2024 NaNoWriMo cohorts are
 * only distinguishable by view.
 *
 *   PUBLIC_AIRTABLE_API_KEY=… pnpm exec tsx scripts/airtable/snapshotChallenges.ts
 */

const PUBLIC_DATA_BASE = 'appJStQemmYeoRcox';
const MONTHLY_CHALLENGES_BASE = 'app10kd5ewHiLTjxn';

const OUT_DIR = join(
	dirname(fileURLToPath(import.meta.url)),
	'../../src/data/monthlyChallenges/data',
);

type Snapshot = {
	/** Output filename, written into src/data/monthlyChallenges/data/. */
	file: string;
	baseId: string;
	table: string;
	/** Omitted only where the old fetch also read the whole table. */
	view?: string;
	/** Written in this order, so a re-run produces an identical file. */
	fields: string[];
};

const SNAPSHOTS: Snapshot[] = [
	{
		file: 'member-articles.json',
		baseId: PUBLIC_DATA_BASE,
		table: 'Member Articles',
		fields: [
			'Member Name',
			'GitHubUsername',
			'TwitterUsername',
			'Title',
			'Url',
			'Word Count',
			'Date Published',
		],
	},
	{
		file: 'hacktoberfest-2022-repos.json',
		baseId: PUBLIC_DATA_BASE,
		table: 'Hacktoberfest2022 Repos',
		view: 'Default',
		fields: ['RepoName', 'RepoUrl', 'Description', 'Maintainer'],
	},
	{
		file: 'nanowrimo-2023.json',
		baseId: MONTHLY_CHALLENGES_BASE,
		table: 'NaNoWriMo',
		view: 'NaNoWriMo 2023',
		fields: [
			'Name',
			'GitHubUsername',
			'EntryTitle',
			'EntryUrl',
			'EntryDate',
			'WordCount',
			'Topics',
			'ShortDescription',
		],
	},
	{
		file: 'nanowrimo-2024.json',
		baseId: MONTHLY_CHALLENGES_BASE,
		table: 'NaNoWriMo',
		view: 'NaNoWriMo 2024',
		fields: [
			'Name',
			'GitHubUsername',
			'EntryTitle',
			'EntryUrl',
			'EntryDate',
			'WordCount',
			'Topics',
			'ShortDescription',
		],
	},
	{
		file: 'pairing-challenge-2023.json',
		baseId: MONTHLY_CHALLENGES_BASE,
		table: 'Pairing Challenge',
		// The last year the challenge ran. `getTotalPairingSessions()` used to
		// build this view name from the current year, so from 1 Jan 2024 it has
		// been asking Airtable for a view that does not exist.
		view: '2023 Pairing Challenge Results',
		fields: ['Pairing Participants', 'Topic', 'Pairing Sessions'],
	},
];

/** Drop empty values rather than writing `null`s the old `fields` object never had. */
function pick(
	row: Record<string, unknown>,
	fields: string[],
): Record<string, unknown> {
	const picked: Record<string, unknown> = {};
	for (const field of fields) {
		const value = row[field];
		if (value === undefined || value === null || value === '') continue;
		picked[field] = value;
	}
	return picked;
}

async function main() {
	const apiKey = process.env.PUBLIC_AIRTABLE_API_KEY;

	if (!apiKey) {
		console.error(
			'PUBLIC_AIRTABLE_API_KEY is not set. Ask a maintainer for a read key\nfor the Public Data and Monthly Challenges bases.',
		);
		process.exit(1);
	}

	mkdirSync(OUT_DIR, { recursive: true });

	for (const snapshot of SNAPSHOTS) {
		const base = new Airtable({ apiKey }).base(snapshot.baseId);
		const records = await base(snapshot.table)
			.select(snapshot.view ? { view: snapshot.view } : {})
			.all();

		const rows = records.map((record) =>
			pick(record.fields as Record<string, unknown>, snapshot.fields),
		);

		writeFileSync(
			join(OUT_DIR, snapshot.file),
			`${JSON.stringify(rows, null, '\t')}\n`,
		);

		console.log(
			`${snapshot.file}: ${rows.length} rows from ${snapshot.table}${
				snapshot.view ? ` (${snapshot.view})` : ''
			}`,
		);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
