import Airtable from 'airtable';
import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';

import {
	cocReport,
	coffeeTableGroupRequest,
	db,
	lunchAndLearnIdea,
	submissionEvent,
	volunteerSignup,
} from '../../src/db';
import { ATTACHMENT_STORE } from '../../src/lib/attachments';

/**
 * One-off import of the Airtable "Form Submissions" base into Postgres.
 *
 * Four tables, 79 rows between them. Idempotent: every row is keyed on
 * `airtable_record_id`, so a re-run inserts only what is missing. Run with
 * `--dry-run` first and check the counts against the numbers below.
 *
 * Two things about this data are easy to get wrong:
 *
 *   - `createdTime` is not the submission date. The CoC, Volunteer and Coffee
 *     Table tables carry `import_created_at` from an earlier migration off
 *     Netlify Forms, and most rows share a bulk `createdTime` of 2024-09-25.
 *     Preferring `createdTime` would misdate almost every historical row.
 *   - Four CoC reports carry attachment metadata pointing at
 *     `LEGACY_CDN_HOST`, Netlify's legacy asset CDN. Those URLs still resolve,
 *     so the files are fetched into Netlify Blobs here rather than left as a
 *     dead link.
 *
 * A dry run needs only the Airtable key. A real run also needs a blob store,
 * because storing those four attachments happens outside the Netlify runtime —
 * it fails up front rather than silently importing 79 rows with no files
 * attached. The wrapper supplies a local store; NETLIFY_SITE_ID and
 * NETLIFY_AUTH_TOKEN target the production one instead.
 *
 * Full runbook: scripts/airtable/README.md.
 *
 *   FORMS_AIRTABLE_API_KEY=… pnpm exec tsx scripts/airtable/importSubmissions.ts --dry-run
 *
 *   FORMS_AIRTABLE_API_KEY=… pnpm exec tsx scripts/with-local-netlify.ts \
 *     tsx scripts/airtable/importSubmissions.ts
 */

const BASE_ID = 'appZ4d2Q9K0IepQnA';

/** The only place a legacy attachment lives; anything else is not fetched. */
const LEGACY_CDN_HOST = 'd33wubrfki0l68.cloudfront.net';

/** Read from Airtable on 2026-09-09; a dry run prints these alongside what it found. */
const EXPECTED: Record<string, number> = {
	'Volunteer Form': 50,
	'CoC Violation Reports': 18,
	'Lunch and Learn Idea': 9,
	'New Coffee Table Group': 2,
};

type AirtableRow = {
	id: string;
	createdTime: string;
	fields: Record<string, unknown>;
};

function str(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function date(value: unknown): Date | null {
	const raw = str(value);
	if (!raw) return null;
	const parsed = new Date(raw);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * The real submission date.
 *
 * `import_created_at` is when the row was created in Netlify Forms; Airtable's
 * own `createdTime` is when it was bulk-imported here. Prefer the former.
 */
function submittedAt(row: AirtableRow): Date {
	return (
		date(row.fields.import_created_at) ?? date(row.createdTime) ?? new Date()
	);
}

async function fetchAll(table: string, apiKey: string): Promise<AirtableRow[]> {
	const base = new Airtable({ apiKey }).base(BASE_ID);
	const rows: AirtableRow[] = [];

	await base(table)
		.select({ pageSize: 100 })
		.eachPage((records, next) => {
			for (const record of records) {
				rows.push({
					id: record.id,
					createdTime: record._rawJson.createdTime,
					fields: record.fields as Record<string, unknown>,
				});
			}
			next();
		});

	return rows;
}

type LegacyAttachment = {
	filename: string;
	type: string;
	size: number;
	url: string;
};

/** `uploadedFiles` holds a JSON blob, not an Airtable attachment array. */
function parseLegacyAttachment(value: unknown): LegacyAttachment | null {
	const raw = str(value);
	if (!raw) return null;

	try {
		const parsed = JSON.parse(raw) as Partial<LegacyAttachment>;
		if (!parsed.url || !parsed.filename) return null;
		return {
			filename: parsed.filename,
			type: parsed.type ?? 'application/octet-stream',
			size: Number(parsed.size) || 0,
			url: parsed.url,
		};
	} catch {
		return null;
	}
}

/** Content types the legacy blob never records reliably; sniff the bytes instead. */
function sniffContentType(bytes: Uint8Array, fallback: string): string {
	if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'image/png';
	if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
	if (bytes[0] === 0x47 && bytes[1] === 0x49) return 'image/gif';
	if (bytes[0] === 0x25 && bytes[1] === 0x50) return 'application/pdf';
	if (bytes[0] === 0x50 && bytes[1] === 0x4b) return 'application/zip';
	return fallback;
}

type StoredLegacy = {
	key: string;
	filename: string;
	contentType: string;
	size: number;
};

/**
 * The blob store.
 *
 * `getStore(name)` reads credentials from the environment, which
 * `scripts/with-local-netlify.ts` fills in with a local sandbox store — the
 * same reason it also supplies the database connection string. Passing
 * NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN overrides that and writes to the real
 * production store, which is what a live migration needs.
 *
 * With neither, the writes fail with "The environment has not been configured
 * to use Netlify Blobs", which the per-file error handling would report as a
 * skipped attachment: a config mistake dressed up as a dead URL. Hence the
 * preflight below.
 */
function attachmentStore() {
	const siteID = process.env.NETLIFY_SITE_ID;
	const token = process.env.NETLIFY_AUTH_TOKEN;

	return siteID && token
		? getStore({ name: ATTACHMENT_STORE, siteID, token })
		: getStore(ATTACHMENT_STORE);
}

/**
 * Fail before importing anything rather than after, so a misconfigured run
 * cannot quietly drop every attachment and still report success.
 */
async function assertBlobsUsable(): Promise<void> {
	try {
		// A read of a key that does not exist is enough to prove credentials.
		await attachmentStore().get('__preflight__');
	} catch (error) {
		throw new Error(
			'Netlify Blobs is not configured, so the four historical CoC ' +
				'attachments could not be stored.\n\n' +
				'Run this through the wrapper, which supplies a local store:\n\n' +
				'  pnpm exec tsx scripts/with-local-netlify.ts \\\n' +
				'    tsx scripts/airtable/importSubmissions.ts\n\n' +
				'To write to the production store instead, set NETLIFY_SITE_ID and ' +
				'NETLIFY_AUTH_TOKEN.\n\n' +
				`Underlying error: ${
					error instanceof Error ? error.message : String(error)
				}`,
		);
	}
}

async function rehost(
	attachment: LegacyAttachment,
	dryRun: boolean,
): Promise<StoredLegacy | null> {
	const url = URL.parse(attachment.url);
	if (url?.protocol !== 'https:' || url.hostname !== LEGACY_CDN_HOST) {
		console.warn(
			`  ! ${attachment.filename}: ${attachment.url} is not on ${LEGACY_CDN_HOST}; skipping the file.`,
		);
		return null;
	}

	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(30_000),
		});

		if (!response.ok) {
			console.warn(
				`  ! ${attachment.filename}: CDN returned ${response.status}; skipping the file.`,
			);
			return null;
		}

		const buffer = await response.arrayBuffer();
		const bytes = new Uint8Array(buffer);
		const contentType = sniffContentType(bytes, attachment.type);
		const key = randomUUID();

		if (!dryRun) {
			await attachmentStore().set(key, buffer, {
				metadata: { filename: attachment.filename, contentType },
			});
		}

		console.log(
			`  + ${attachment.filename} (${buffer.byteLength} bytes, ${contentType})`,
		);

		return {
			key,
			filename: attachment.filename,
			contentType,
			size: buffer.byteLength,
		};
	} catch (error) {
		// A dead URL is not a reason to abandon the whole import — the report
		// text matters far more than the screenshot.
		console.warn(
			`  ! ${attachment.filename}: ${
				error instanceof Error ? error.message : 'fetch failed'
			}; skipping the file.`,
		);
		return null;
	}
}

async function main() {
	const dryRun = process.argv.slice(2).includes('--dry-run');

	const apiKey = process.env.FORMS_AIRTABLE_API_KEY;
	if (!apiKey) {
		throw new Error(
			'FORMS_AIRTABLE_API_KEY is not set. Ask a maintainer for a read key ' +
				'for the Form Submissions base.',
		);
	}

	// A dry run still fetches the attachments (to prove the URLs resolve) but
	// never writes them, so it does not need working blob credentials.
	if (!dryRun) {
		await assertBlobsUsable();
	}

	console.log(dryRun ? 'Dry run — nothing will be written.\n' : 'Importing.\n');

	const summary: Record<string, { found: number; inserted: number }> = {};

	/** Insert one row and its `imported` event, skipping anything already there. */
	async function importRows<T extends Record<string, unknown>>(
		label: string,
		rows: AirtableRow[],
		table:
			| typeof cocReport
			| typeof volunteerSignup
			| typeof lunchAndLearnIdea
			| typeof coffeeTableGroupRequest,
		eventKey:
			| 'cocReportId'
			| 'volunteerSignupId'
			| 'lunchAndLearnIdeaId'
			| 'coffeeTableGroupRequestId',
		toValues: (row: AirtableRow) => Promise<T> | T,
	) {
		let inserted = 0;

		// Oldest first, so the `reference` identity column — the number
		// maintainers see — counts up with submission age rather than Airtable's
		// fetch order.
		const inOrder = [...rows].sort(
			(a, b) => submittedAt(a).getTime() - submittedAt(b).getTime(),
		);

		for (const row of inOrder) {
			const values = await toValues(row);

			if (dryRun) {
				inserted++;
				continue;
			}

			// `onConflictDoNothing` on the unique airtable_record_id is what makes
			// a re-run safe — which is also why the row and its `imported` event
			// commit together: a re-run would never come back for the event.
			const created = await db().transaction(async (tx) => {
				const [stored] = await tx
					.insert(table)
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					.values(values as any)
					.onConflictDoNothing({ target: table.airtableRecordId })
					.returning({ id: table.id });

				if (!stored) return false;

				await tx.insert(submissionEvent).values({
					[eventKey]: stored.id,
					type: 'imported',
					body: `Imported from Airtable (${row.id})`,
				});
				return true;
			});

			if (!created) continue;

			inserted++;
		}

		summary[label] = { found: rows.length, inserted };
	}

	// --- Volunteer Form ----------------------------------------------------
	const volunteers = await fetchAll('Volunteer Form', apiKey);
	await importRows(
		'Volunteer Form',
		volunteers,
		volunteerSignup,
		'volunteerSignupId',
		(row) => ({
			name: str(row.fields.name) ?? 'Unknown',
			email: str(row.fields.email) ?? '',
			githubUsername: str(row.fields.github_username),
			position: str(row.fields.position),
			description: str(row.fields.description),
			submittedAt: submittedAt(row),
			status: 'new' as const,
			airtableRecordId: row.id,
		}),
	);

	// --- CoC Violation Reports ---------------------------------------------
	const reports = await fetchAll('CoC Violation Reports', apiKey);
	await importRows(
		'CoC Violation Reports',
		reports,
		cocReport,
		'cocReportId',
		async (row) => {
			const legacy = parseLegacyAttachment(row.fields.uploadedFiles);
			const stored = legacy ? await rehost(legacy, dryRun) : null;

			return {
				name: str(row.fields.name),
				email: str(row.fields.email),
				reporteeName: str(row.fields.reportee_name) ?? 'Unknown',
				timeLocation: str(row.fields.time_location) ?? '',
				description: str(row.fields.description) ?? '',
				anyoneElseInvolved: str(row.fields.anyone_else_involved),
				attachmentBlobKey: stored?.key ?? null,
				attachmentFilename: stored?.filename ?? legacy?.filename ?? null,
				attachmentContentType: stored?.contentType ?? null,
				attachmentSize: stored?.size ?? null,
				submittedAt: submittedAt(row),
				status: 'new' as const,
				airtableRecordId: row.id,
			};
		},
	);

	// --- Lunch and Learn Idea ----------------------------------------------
	const ideas = await fetchAll('Lunch and Learn Idea', apiKey);
	await importRows(
		'Lunch and Learn Idea',
		ideas,
		lunchAndLearnIdea,
		'lunchAndLearnIdeaId',
		(row) => ({
			name: str(row.fields.Name) ?? 'Unknown',
			email: str(row.fields.Email) ?? '',
			topic: str(row.fields.Topic) ?? 'Untitled',
			description: str(row.fields.Description),
			format: str(row.fields.Format),
			timing: str(row.fields.Timing),
			submittedAt: submittedAt(row),
			status: 'new' as const,
			airtableRecordId: row.id,
		}),
	);

	// --- New Coffee Table Group --------------------------------------------
	const groups = await fetchAll('New Coffee Table Group', apiKey);
	await importRows(
		'New Coffee Table Group',
		groups,
		coffeeTableGroupRequest,
		'coffeeTableGroupRequestId',
		(row) => ({
			name: str(row.fields.name) ?? 'Unknown',
			email: str(row.fields.email) ?? '',
			groupName: str(row.fields.group_name),
			description: str(row.fields.description),
			submittedAt: submittedAt(row),
			status: 'new' as const,
			airtableRecordId: row.id,
		}),
	);

	console.log('\nTable                    found  expected  inserted');
	for (const [label, counts] of Object.entries(summary)) {
		const expected = EXPECTED[label] ?? 0;
		const flag = counts.found === expected ? ' ' : '*';
		console.log(
			`${label.padEnd(24)} ${String(counts.found).padStart(5)}  ${String(
				expected,
			).padStart(8)}  ${String(counts.inserted).padStart(8)}${flag}`,
		);
	}
	console.log(
		'\n* means the row count has drifted from what was in Airtable on ' +
			'2026-09-09. A small difference is expected if anyone has submitted ' +
			'since; a large one is worth understanding before importing.',
	);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
