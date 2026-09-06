import fs from 'fs';
import path from 'path';

/**
 * Copy drizzle-kit's generated SQL into the layout Netlify applies on deploy.
 *
 * drizzle-kit writes `drizzle/0000_some_name.sql` and keeps a journal in
 * `drizzle/meta/` that later `generate` runs diff against. Netlify instead
 * expects `netlify/database/migrations/<version>_<slug>/migration.sql`, sorted
 * lexicographically, with slugs restricted to lowercase alphanumerics and
 * hyphens.
 *
 * The two disagree about numbering: drizzle starts at `0000`, but Netlify
 * parses the prefix as a version and rejects `0` as "out of order (version 0
 * <= max applied 0)". So the prefix here is a UTC `YYYYMMDDHHmmss` stamp
 * derived from the journal's `when` field — matching Netlify's own documented
 * example, and stable across runs because it comes from the journal rather
 * than the clock.
 *
 * Existing migrations are matched by slug and never rewritten: once one has
 * been applied to a deployed database, editing it would silently diverge the
 * schema from what production actually ran.
 */

const DRIZZLE_DIR = path.join('.', 'drizzle');
const JOURNAL = path.join(DRIZZLE_DIR, 'meta', '_journal.json');
const NETLIFY_DIR = path.join('.', 'netlify', 'database', 'migrations');

type JournalEntry = { idx: number; when: number; tag: string };

function toSlug(tag: string) {
	const [, ...rest] = tag.split('_');
	return rest.join('-').replace(/[^a-z0-9-]/g, '-');
}

/** `1788665530987` -> `20260305101210` */
function toVersion(when: number) {
	return new Date(when)
		.toISOString()
		.replace(/[-:TZ.]/g, '')
		.slice(0, 14);
}

function main() {
	if (!fs.existsSync(JOURNAL)) {
		console.error(`No ${JOURNAL} — run \`drizzle-kit generate\` first.`);
		process.exitCode = 1;
		return;
	}

	fs.mkdirSync(NETLIFY_DIR, { recursive: true });

	const journal: { entries: JournalEntry[] } = JSON.parse(
		fs.readFileSync(JOURNAL, 'utf8'),
	);
	const existing = fs
		.readdirSync(NETLIFY_DIR, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name);

	let written = 0;

	for (const entry of [...journal.entries].sort((a, b) => a.idx - b.idx)) {
		const slug = toSlug(entry.tag);

		if (existing.some((name) => name.slice(name.indexOf('_') + 1) === slug)) {
			continue;
		}

		const source = path.join(DRIZZLE_DIR, `${entry.tag}.sql`);
		if (!fs.existsSync(source)) {
			console.error(`Journal names ${entry.tag} but ${source} is missing.`);
			process.exitCode = 1;
			return;
		}

		// drizzle's statement-breakpoint markers are its own bookkeeping and mean
		// nothing to Netlify; they are valid SQL comments but only add noise.
		const sql = fs
			.readFileSync(source, 'utf8')
			.replace(/-->\s*statement-breakpoint\n?/g, '');

		const dir = path.join(NETLIFY_DIR, `${toVersion(entry.when)}_${slug}`);
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, 'migration.sql'), sql, 'utf8');
		console.log(`wrote ${path.join(dir, 'migration.sql')}`);
		written += 1;
	}

	console.log(
		written === 0
			? `Up to date — ${journal.entries.length} migration(s), nothing new.`
			: `Synced ${written} new migration(s).`,
	);
}

main();
