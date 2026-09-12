import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import { db, inviteToken } from '@/db';
import { insertApplication } from '@/test/db/fixtures';

import { createSlackInviteToken, redeemSlackInviteToken } from './inviteTokens';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

describe('Slack invite tokens', () => {
	test('only the hash is stored, and it expires in 30 days', async () => {
		const { id } = await insertApplication({ status: 'coffee_invited' });
		const before = Date.now();

		const { token, expiresAt } = await createSlackInviteToken(id);

		const [row] = await db().select().from(inviteToken);
		expect(row).toMatchObject({
			tokenHash: expect.schemaMatching(z.hash('sha256')),
			applicationId: id,
			usedAt: null,
		});
		expect(row.tokenHash).not.toBe(token);
		expect(expiresAt).toEqual(
			expect.schemaMatching(z.date().min(new Date(before + THIRTY_DAYS))),
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
