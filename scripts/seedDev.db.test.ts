import { and, count, eq, getTableName, is, isNotNull, sql } from 'drizzle-orm';
import { PgTable, isPgEnum, type PgEnum } from 'drizzle-orm/pg-core';
import { describe, expect, test } from 'vitest';

import * as schema from '@/db/schema';
import {
	db,
	devtoolsUser,
	pendingGrant,
	volunteer,
	volunteerInviteLedger,
} from '@/db';
import {
	inviteForClaimToken,
	volunteerBalance,
} from '@/lib/volunteers/invites';
import { slackInviteForToken } from '@/lib/waitlist/inviteTokens';

import { seedDev } from './seed';
import { ATTACHMENT, NEW_VOLUNTEER } from './seed/shared';

/**
 * The seed's promise is coverage: every status, reason and event type the
 * schema declares appears at least once, so adding one to an enum without a
 * row for it fails here rather than going unnoticed until someone opens the
 * screen that renders it.
 */

/** Which column of which table each enum is stored in. */
const ENUM_COLUMNS: Record<string, { table: PgTable; column: string }[]> = {
	application_status: [
		{ table: schema.membershipApplication, column: 'status' },
	],
	application_source: [
		{ table: schema.membershipApplication, column: 'source' },
	],
	application_event_type: [{ table: schema.applicationEvent, column: 'type' }],
	invite_status: [{ table: schema.invite, column: 'status' }],
	invite_token_purpose: [{ table: schema.inviteToken, column: 'purpose' }],
	volunteer_ledger_reason: [
		{ table: schema.volunteerInviteLedger, column: 'reason' },
	],
	accrual_notice_outcome: [
		{ table: schema.volunteerAccrualNotice, column: 'outcome' },
	],
	submission_status: [
		{ table: schema.cocReport, column: 'status' },
		{ table: schema.volunteerSignup, column: 'status' },
		{ table: schema.lunchAndLearnIdea, column: 'status' },
		{ table: schema.coffeeTableGroupRequest, column: 'status' },
	],
	submission_event_type: [{ table: schema.submissionEvent, column: 'type' }],
};

/** Better Auth's own tables: only a real sign-in writes these. */
const NOT_SEEDED = new Set(['session', 'account', 'verification']);

function fakeStore() {
	const writes: { key: string; bytes: Uint8Array; metadata: unknown }[] = [];
	return {
		writes,
		set: async (
			key: string,
			data: ArrayBuffer,
			options?: { metadata?: unknown },
		) => {
			writes.push({
				key,
				bytes: new Uint8Array(data),
				metadata: options?.metadata,
			});
		},
	};
}

async function distinct(table: PgTable, column: string): Promise<string[]> {
	const rows = await db()
		.selectDistinct({ value: sql<string>`${sql.identifier(column)}` })
		.from(table);
	return rows.map((row) => row.value).sort();
}

async function countRows(table: PgTable): Promise<number> {
	const [row] = await db().select({ count: count() }).from(table);
	return row.count;
}

async function references(table: PgTable): Promise<number[]> {
	const rows = await db()
		.select({ reference: sql<number>`reference` })
		.from(table)
		.orderBy(sql`reference`);
	return rows.map((row) => row.reference);
}

const ENUMS: PgEnum<[string, ...string[]]>[] = [];
for (const value of Object.values(schema)) {
	if (isPgEnum(value)) ENUMS.push(value);
}

const WITH_REFERENCE = [
	schema.membershipApplication,
	schema.cocReport,
	schema.volunteerSignup,
	schema.lunchAndLearnIdea,
	schema.coffeeTableGroupRequest,
];

describe('seedDev', { timeout: 60_000 }, () => {
	test('covers every enum value and every table', async () => {
		await seedDev({ attachmentStore: fakeStore() });

		expect(ENUMS.map((e) => e.enumName).sort()).toEqual(
			Object.keys(ENUM_COLUMNS).sort(),
		);
		for (const pgEnum of ENUMS) {
			const seen = new Set<string>();
			for (const { table, column } of ENUM_COLUMNS[pgEnum.enumName]) {
				for (const value of await distinct(table, column)) seen.add(value);
			}
			expect({ [pgEnum.enumName]: [...seen].sort() }).toEqual({
				[pgEnum.enumName]: [...pgEnum.enumValues].sort(),
			});
		}

		for (const table of Object.values(schema).filter((value) =>
			is(value, PgTable),
		)) {
			const name = getTableName(table);
			if (NOT_SEEDED.has(name)) continue;
			expect({ [name]: await countRows(table) }).not.toEqual({ [name]: 0 });
		}
	});

	test('the printed links resolve', async () => {
		const report = await seedDev({ attachmentStore: fakeStore() });

		expect(await inviteForClaimToken(report.claimToken)).toMatchObject({
			inviteeEmail: 'rosa@example.com',
		});
		expect(await slackInviteForToken(report.slackToken)).toMatchObject({
			ok: true,
		});
	});

	test('writes the CoC attachment under the key its row names', async () => {
		const store = fakeStore();
		// Stands in for the placeholder the CLI fetches: PNG magic, then noise.
		const attachment = Uint8Array.from([
			0x89,
			0x50,
			0x4e,
			0x47,
			...Array(500).fill(7),
		]);
		await seedDev({ attachmentStore: store, attachment });

		const [row] = await db()
			.select({
				key: schema.cocReport.attachmentBlobKey,
				size: schema.cocReport.attachmentSize,
			})
			.from(schema.cocReport)
			.where(isNotNull(schema.cocReport.attachmentBlobKey));
		expect(store.writes).toHaveLength(1);
		expect(store.writes[0].key).toBe(row.key);
		expect(store.writes[0].key).toBe(ATTACHMENT.key);
		expect(store.writes[0].bytes.byteLength).toBe(row.size);
		expect(row.size).toBe(504);
		// PNG magic, which `sniff()` in src/lib/submissions/attachments.ts requires.
		expect([...store.writes[0].bytes.slice(0, 4)]).toEqual([
			0x89, 0x50, 0x4e, 0x47,
		]);
		expect(store.writes[0].metadata).toEqual({
			filename: ATTACHMENT.filename,
			contentType: ATTACHMENT.contentType,
		});
	});

	test('registers a Volunteer with an allowance for the devtools panel', async () => {
		await seedDev({ attachmentStore: null });

		const managed = await db()
			.select({
				templateKey: devtoolsUser.templateKey,
				userId: devtoolsUser.userId,
			})
			.from(devtoolsUser);
		expect(managed.map((row) => row.templateKey).sort()).toEqual([
			'admin',
			'coc_reviewer',
			'volunteer',
		]);

		const volunteerUser = managed.find(
			(row) => row.templateKey === 'volunteer',
		);
		const [roster] = await db()
			.select({ slackUserId: volunteer.slackUserId })
			.from(volunteer)
			.where(
				and(
					eq(volunteer.userId, volunteerUser!.userId),
					isNotNull(volunteer.userId),
				),
			);
		expect(roster).toBeDefined();
		expect(await volunteerBalance(roster.slackUserId)).toBeGreaterThan(0);
	});

	test('a Volunteer who has not signed in has a roster row and an unclaimed grant', async () => {
		await seedDev({ attachmentStore: null });

		const [roster] = await db()
			.select({ userId: volunteer.userId })
			.from(volunteer)
			.where(eq(volunteer.slackUserId, NEW_VOLUNTEER.slackUserId));
		expect(roster).toEqual({ userId: null });

		const grants = await db()
			.select({ role: pendingGrant.role, claimedAt: pendingGrant.claimedAt })
			.from(pendingGrant)
			.where(eq(pendingGrant.slackUserId, NEW_VOLUNTEER.slackUserId));
		expect(grants).toEqual([{ role: 'volunteer', claimedAt: null }]);
		expect(await volunteerBalance(NEW_VOLUNTEER.slackUserId)).toBe(1);
	});

	test('a second run reproduces the same rows and references', async () => {
		await seedDev({ attachmentStore: null });
		const tables = Object.values(schema).filter((value) => is(value, PgTable));
		const before = await Promise.all(tables.map(countRows));
		const referencesBefore = await Promise.all(WITH_REFERENCE.map(references));

		await seedDev({ attachmentStore: null });

		expect(await Promise.all(tables.map(countRows))).toEqual(before);
		expect(await Promise.all(WITH_REFERENCE.map(references))).toEqual(
			referencesBefore,
		);
		expect(referencesBefore[0][0]).toBe(1);
	});

	test('leaves a user it did not seed alone', async () => {
		await db().insert(schema.user).values({
			id: 'real-person',
			name: 'Real Person',
			email: 'real@example.test',
			slackUserId: 'U_REAL',
		});
		await seedDev({ attachmentStore: null });

		const [row] = await db()
			.select({ id: schema.user.id })
			.from(schema.user)
			.where(eq(schema.user.id, 'real-person'));
		expect(row).toBeDefined();
		// Sanity: the ledger really was rebuilt rather than appended to.
		expect(await countRows(volunteerInviteLedger)).toBeLessThan(40);
	});
});
