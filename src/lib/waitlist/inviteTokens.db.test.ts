import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import { db, inviteToken } from '@/db';
import { insertApplication } from '@/test/db/fixtures';

import {
	createSlackInviteToken,
	expireSlackInviteToken,
	redeemSlackInviteToken,
	slackInviteForToken,
	supersedeSlackInviteTokens,
} from './inviteTokens';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

describe('Slack invite tokens', () => {
	test('only the hash is stored, and it expires in 30 days', async () => {
		const { id } = await insertApplication({ status: 'coffee_invited' });
		const before = Date.now();

		const { token, expiresAt } = await createSlackInviteToken(id);
		const after = Date.now();

		const [row] = await db().select().from(inviteToken);
		expect(row).toMatchObject({
			tokenHash: expect.schemaMatching(z.hash('sha256')),
			applicationId: id,
			usedAt: null,
		});
		expect(row.tokenHash).not.toBe(token);
		expect(expiresAt).toEqual(
			expect.schemaMatching(
				z
					.date()
					.min(new Date(before + THIRTY_DAYS))
					.max(new Date(after + THIRTY_DAYS)),
			),
		);
	});

	test('redeems once; the second attempt is told it was used', async () => {
		const { id } = await insertApplication({ status: 'coffee_invited' });
		const { token } = await createSlackInviteToken(id);

		await expect(redeemSlackInviteToken(token)).resolves.toEqual({
			ok: true,
			applicationId: id,
		});
		await expect(redeemSlackInviteToken(token)).resolves.toEqual({
			ok: false,
			reason: 'used',
		});
		await expect(redeemSlackInviteToken('never-issued')).resolves.toEqual({
			ok: false,
			reason: 'unknown',
		});
	});

	/**
	 * /join-slack is fetched by link scanners before the person clicks, so the
	 * page must be able to check the token any number of times without
	 * spending it.
	 */
	test('looking a token up does not spend it', async () => {
		const { id } = await insertApplication({ status: 'coffee_invited' });
		const { token } = await createSlackInviteToken(id);

		await expect(slackInviteForToken(token)).resolves.toEqual({
			ok: true,
			applicationId: id,
		});
		await expect(slackInviteForToken(token)).resolves.toEqual({
			ok: true,
			applicationId: id,
		});
		await expect(redeemSlackInviteToken(token)).resolves.toEqual({
			ok: true,
			applicationId: id,
		});
		await expect(slackInviteForToken(token)).resolves.toEqual({
			ok: false,
			reason: 'used',
		});
	});

	test("superseding retires the earlier live tokens, and nobody else's", async () => {
		const { id } = await insertApplication({ status: 'member' });
		const other = await insertApplication({ status: 'member' });
		const { token: first } = await createSlackInviteToken(id);
		const { token: theirs } = await createSlackInviteToken(other.id);
		const second = await createSlackInviteToken(id);

		await supersedeSlackInviteTokens(id, second, new Date());

		await expect(slackInviteForToken(first)).resolves.toEqual({
			ok: false,
			reason: 'expired',
		});
		await expect(redeemSlackInviteToken(second.token)).resolves.toEqual({
			ok: true,
			applicationId: id,
		});
		// Another application's token is not touched.
		await expect(slackInviteForToken(theirs)).resolves.toEqual({
			ok: true,
			applicationId: other.id,
		});
	});

	/**
	 * Both mints are pinned to one instant: a double-click, two maintainers at
	 * once, or this suite under load. Mint order then rests on the id alone.
	 */
	async function mintTwoAtOnce(applicationId: string) {
		const first = await createSlackInviteToken(applicationId);
		const second = await createSlackInviteToken(applicationId);
		await db()
			.update(inviteToken)
			.set({ createdAt: new Date('2026-09-16T12:00:00Z') })
			.where(eq(inviteToken.applicationId, applicationId));
		return { first, second };
	}

	test('a superseded token redeems as expired, not used, and stays unused', async () => {
		const { id } = await insertApplication({ status: 'member' });
		const {
			first: { token: first },
			second,
		} = await mintTwoAtOnce(id);
		await supersedeSlackInviteTokens(id, second, new Date());

		await expect(redeemSlackInviteToken(first)).resolves.toEqual({
			ok: false,
			reason: 'expired',
		});
		const rows = await db().select().from(inviteToken);
		expect(rows.map((row) => row.usedAt)).toEqual([null, null]);
	});

	// The newest link survives whichever re-send finishes last: superseding
	// from an older token leaves the newer one alone.
	test('superseding is by mint order, so a later token is never retired by an earlier one', async () => {
		const { id } = await insertApplication({ status: 'member' });
		const { first, second } = await mintTwoAtOnce(id);

		await supersedeSlackInviteTokens(id, first, new Date());

		await expect(slackInviteForToken(first.token)).resolves.toEqual({
			ok: true,
			applicationId: id,
		});
		await expect(slackInviteForToken(second.token)).resolves.toEqual({
			ok: true,
			applicationId: id,
		});
	});

	test('minting leaves the previous token live; expiring by id takes only that one', async () => {
		const { id } = await insertApplication({ status: 'member' });
		const first = await createSlackInviteToken(id);
		const second = await createSlackInviteToken(id);

		await expect(slackInviteForToken(first.token)).resolves.toEqual({
			ok: true,
			applicationId: id,
		});

		await expireSlackInviteToken(second.id, new Date());

		await expect(slackInviteForToken(second.token)).resolves.toEqual({
			ok: false,
			reason: 'expired',
		});
		await expect(redeemSlackInviteToken(first.token)).resolves.toEqual({
			ok: true,
			applicationId: id,
		});
	});

	test('an expired token is refused and stays unused', async () => {
		const { id } = await insertApplication({ status: 'coffee_invited' });
		const { token } = await createSlackInviteToken(id);
		await db()
			.update(inviteToken)
			.set({ expiresAt: new Date(Date.now() - 1000) })
			.where(eq(inviteToken.applicationId, id));

		await expect(redeemSlackInviteToken(token)).resolves.toEqual({
			ok: false,
			reason: 'expired',
		});
		const [row] = await db().select().from(inviteToken);
		expect(row.usedAt).toBeNull();
	});
});
