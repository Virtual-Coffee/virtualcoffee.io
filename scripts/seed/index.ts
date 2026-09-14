import { APPLICATION_COUNT, seedApplications } from './applications';
import { SEED_PNG, writeAttachment, type AttachmentStore } from './attachment';
import { reset } from './reset';
import { CLAIM_TOKEN } from './shared';
import { SUBMISSION_COUNT, seedSubmissions } from './submissions';
import { seedUsers } from './users';
import { seedVolunteers } from './volunteers';

export type SeedReport = {
	/** Plaintext Claim Link token for the one pending Invite. */
	claimToken: string;
	/** Plaintext Slack join token for the member whose invite was re-sent. */
	slackToken: string;
	applications: number;
	submissions: number;
};

/**
 * Seed the local development database: clear what the last run wrote, then
 * insert every row in a fixed order so a re-run reproduces the same
 * `reference` numbers and the same two links.
 *
 * Sections run in dependency order — users before the Volunteer roster that
 * links to them, Invites before the applications that were claimed from
 * them. Nothing here checks the environment; `scripts/seedDev.ts` does that
 * before calling in, and the db test calls it directly against PGlite.
 */
export async function seedDev({
	attachmentStore,
}: {
	/** Where the CoC attachment goes; `null` leaves the row pointing at nothing. */
	attachmentStore: AttachmentStore | null;
}): Promise<SeedReport> {
	await reset();
	await seedUsers();
	const invitesByEmail = await seedVolunteers();
	const { slackToken } = await seedApplications(invitesByEmail);
	await seedSubmissions(SEED_PNG.byteLength);
	if (attachmentStore) await writeAttachment(attachmentStore);

	return {
		claimToken: CLAIM_TOKEN,
		slackToken,
		applications: APPLICATION_COUNT,
		submissions: SUBMISSION_COUNT,
	};
}
