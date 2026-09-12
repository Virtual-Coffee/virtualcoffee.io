import { execFileSync, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BlobsServer } from '@netlify/blobs/server';

import { isLocalDatabaseUrl } from './lib/localOnly';

/**
 * Run a command against the local Netlify Database and a local Netlify Blobs
 * store.
 *
 * `netlify dev` provides both to the site process it spawns, but neither to
 * anything else: `netlify dev:exec` passes project env vars and not
 * `NETLIFY_DB_URL`, and the blob sandbox's port and token are generated inside
 * the dev process and never written down. So one-off scripts get nothing
 * ambiently, and this wrapper supplies both —
 *
 *   DATABASE_URL           read from the CLI, refused unless it is local
 *   NETLIFY_DB_URL         the same string, so an inherited one cannot win
 *   NETLIFY_BLOBS_CONTEXT  a second blob server over `netlify dev`'s own files
 *
 * Requires `netlify dev` to already be running in another terminal.
 *
 *   pnpm exec tsx scripts/with-local-netlify.ts tsx scripts/seedDev.ts
 */

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(PROJECT_ROOT, 'node_modules/.bin/netlify');
const BIN_DIR = join(PROJECT_ROOT, 'node_modules/.bin');
const STATE_FILE = join(PROJECT_ROOT, '.netlify/state.json');

/** The directory `netlify dev` serves its blob sandbox from. */
const BLOBS_DIR = join(PROJECT_ROOT, '.netlify/blobs-serve');

function fail(...lines: string[]): never {
	for (const line of lines) console.error(line);
	process.exit(1);
}

/** The shape of `netlify database status --json`, trimmed to what this needs. */
type DatabaseStatus = {
	database: { connectionString: string } | null;
};

/**
 * Ask the CLI for the local connection string.
 *
 * `--json` is parsed rather than scraping the human-readable report for a
 * `postgres://…` substring — the pretty output is prose meant to change, and a
 * rewording (or the connection string appearing in a "run this command"
 * example line) could silently feed the wrong text to `new URL()` below.
 *
 * The guard is the point of this function: a seed or an import must never be
 * able to reach production, so anything that is not plainly local is refused
 * rather than used.
 */
function localDatabaseUrl(): string {
	let output = '';

	try {
		output = execFileSync(
			CLI,
			['database', 'status', '--json', '--show-credentials'],
			{
				cwd: PROJECT_ROOT,
				encoding: 'utf8',
				stdio: ['ignore', 'pipe', 'ignore'],
			},
		);
	} catch {
		// A non-zero exit means there is nothing to parse, which the same branch
		// below covers as a response with no connection string.
	}

	let status: DatabaseStatus | undefined;

	try {
		status = JSON.parse(output) as DatabaseStatus;
	} catch {
		// Not JSON (an empty string when the command above failed, most likely) —
		// covered by the same "could not read" failure as a clean response with a
		// null `database`.
	}

	const url = status?.database?.connectionString;

	if (!url) {
		fail(
			'Could not read a local database connection string.',
			'Is `netlify dev` running? Check `netlify database status`.',
		);
	}

	if (!isLocalDatabaseUrl(url)) {
		fail(
			'Refusing to run: the connection string is not local.',
			'This guard exists so a seed or import can never hit production.',
		);
	}

	return url;
}

type LocalBlobs = { context: string; stop: () => Promise<void> };

/**
 * Start a blob server over the same files `netlify dev` uses.
 *
 * Pointing it at the same directory and site ID is what makes this useful
 * rather than merely present: anything written here is visible to the running
 * site, so an imported CoC attachment can actually be served by `/admin`.
 *
 * Returns `null` when the site ID cannot be found, which is deliberately not
 * fatal — most commands never touch blobs, and the one that does (the
 * submissions import) checks the store itself before importing anything.
 */
async function startBlobs(): Promise<LocalBlobs | null> {
	if (!existsSync(STATE_FILE)) {
		console.warn('No .netlify/state.json — skipping the local blob store.');
		return null;
	}

	let siteId: string | undefined;
	try {
		({ siteId } = JSON.parse(readFileSync(STATE_FILE, 'utf8')) as {
			siteId?: string;
		});
	} catch {
		// A half-written or hand-edited state file is the same situation as
		// none: blobs are best-effort here, and the CLI will rewrite it.
	}

	if (!siteId) {
		console.warn(
			'No site ID in .netlify/state.json — skipping the local blob store.\n' +
				'Run `netlify link` if a command needs blobs.',
		);
		return null;
	}

	mkdirSync(BLOBS_DIR, { recursive: true });

	const token = randomUUID();
	const server = new BlobsServer({ directory: BLOBS_DIR, token });
	const { port } = await server.start();
	const url = `http://localhost:${port}`;

	// The shape `@netlify/blobs` looks for in the environment: `siteID` and
	// `token` are the required pair, the URLs route the requests, and
	// `primaryRegion` is read only for deploy-scoped stores.
	const context = Buffer.from(
		JSON.stringify({
			edgeURL: url,
			uncachedEdgeURL: url,
			siteID: siteId,
			token,
			primaryRegion: 'dev',
		}),
	).toString('base64');

	return {
		context,
		stop: async () => {
			await server.stop();
		},
	};
}

/** Prefer the project's own binaries, so a bare `tsx` works however this was invoked. */
function resolveCommand(command: string): string {
	if (command.includes('/')) return command;
	const local = join(BIN_DIR, command);
	return existsSync(local) ? local : command;
}

function run(command: string, args: string[], env: Record<string, string>) {
	return new Promise<number>((settle) => {
		const child = spawn(resolveCommand(command), args, {
			cwd: PROJECT_ROOT,
			env: { ...process.env, ...env },
			stdio: 'inherit',
		});

		// Ctrl-C reaches the child too, so wait for it to exit and clean up after
		// it rather than tearing this process down first.
		const ignore = () => {};
		process.on('SIGINT', ignore);
		process.on('SIGTERM', ignore);

		child.on('error', (error) => {
			console.error(`Could not run \`${command}\`: ${error.message}`);
			settle(1);
		});
		child.on('exit', (code) => settle(code ?? 1));
	});
}

async function main() {
	const [command, ...args] = process.argv.slice(2);

	if (!command) {
		fail(
			'Usage: pnpm exec tsx scripts/with-local-netlify.ts <command> [args…]',
		);
	}

	const databaseUrl = localDatabaseUrl();
	const blobs = await startBlobs();

	const code = await run(command, args, {
		DATABASE_URL: databaseUrl,
		// `src/db/index.ts` prefers NETLIFY_DB_URL, and the child inherits this
		// shell's environment: set it too, or an exported one points the seed
		// at whatever it names.
		NETLIFY_DB_URL: databaseUrl,
		...(blobs ? { NETLIFY_BLOBS_CONTEXT: blobs.context } : {}),
	});

	await blobs?.stop();
	process.exit(code);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
