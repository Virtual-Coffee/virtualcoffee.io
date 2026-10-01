import { getStore } from '@netlify/blobs';

import { isLocalDatabaseUrl } from './lib/localOnly';

import { ATTACHMENT_STORE } from '@/lib/submissions/attachments';
import { siteUrl } from '@/util/url.server';

import { seedDev } from './seed';
import { fetchPlaceholder } from './seed/attachment';

/**
 * Seed the local development database — `pnpm db:seed`, which runs this
 * under `scripts/with-local-netlify.ts` so the connection string and the
 * blob server are local ones. The work is in `scripts/seed/`; this is the
 * environment check, the blob store and the printout.
 *
 * Safe to re-run: it clears what it wrote last time, restarts the reference
 * counters, and leaves a contributor's own Slack sign-in alone.
 */
async function main() {
	if (process.env.CONTEXT === 'production') {
		throw new Error('Refusing to seed a production database.');
	}
	// The wrapper refuses a non-local connection string, but run directly this
	// script would read whatever the shell carries — a branch database, say.
	const databaseUrl = process.env.NETLIFY_DB_URL ?? process.env.DATABASE_URL;
	if (!databaseUrl || !isLocalDatabaseUrl(databaseUrl)) {
		throw new Error(
			'Refusing to seed: the connection string is not local. Run `pnpm db:seed`.',
		);
	}

	// Scripts do not read `.env`, and `siteUrl()` would otherwise fall back to
	// the production domain for the two links printed below. `||=`, because an
	// empty `URL` would fall back the same way.
	process.env.URL ||= 'http://localhost:9000';

	// The wrapper only exports a blob context when it found a site ID; without
	// one the attachment row still exists, its link just serves nothing.
	const attachmentStore = process.env.NETLIFY_BLOBS_CONTEXT
		? getStore(ATTACHMENT_STORE)
		: null;
	if (!attachmentStore) {
		console.warn(
			'No local blob store — the seeded CoC attachment will not be served.',
		);
	}

	const report = await seedDev({
		attachmentStore,
		attachment: attachmentStore ? await fetchPlaceholder() : undefined,
	});

	console.log(
		`Seeded ${report.applications} membership applications, 4 volunteers, 7 invites, ` +
			`${report.submissions} submissions across 4 kinds, 4 users and 4 pending grants.\n\n` +
			`Claim an Invite:   ${siteUrl()}/join?invite=${report.claimToken}\n` +
			`Join Slack:        ${siteUrl()}/join-slack?code=${report.slackToken}`,
	);
	process.exit(0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
