import { afterEach, describe, expect, test, vi } from 'vitest';

import { redirectTo } from '@/test/next';

import { joinSlack } from './action';

const redeem = vi.hoisted(() => vi.fn());
vi.mock('@/lib/inviteTokens', () => ({ redeemSlackInviteToken: redeem }));

function submission(code?: string) {
	const formData = new FormData();
	if (code) formData.set('code', code);
	return joinSlack(null, formData);
}

describe('joinSlack', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		redeem.mockReset();
	});

	test('a good token is spent and the person is forwarded to Slack', async () => {
		vi.stubEnv('SLACK_JOIN_LINK', 'https://join.slack.com/t/vc/x');
		redeem.mockResolvedValue({ ok: true, applicationId: 'a' });
		await expect(submission('tok')).rejects.toMatchObject(
			redirectTo('https://join.slack.com/t/vc/x'),
		);
		expect(redeem).toHaveBeenCalledWith('tok');
	});

	test('a used token is explained, not thrown', async () => {
		vi.stubEnv('SLACK_JOIN_LINK', 'https://join.slack.com/t/vc/x');
		redeem.mockResolvedValue({ ok: false, reason: 'used' });
		await expect(submission('tok')).resolves.toEqual({
			is_error: true,
			message: expect.stringContaining('already been used'),
		});
	});

	test('a missing join link never spends the token', async () => {
		vi.stubEnv('SLACK_JOIN_LINK', undefined);
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		await expect(submission('tok')).resolves.toMatchObject({ is_error: true });
		expect(redeem).not.toHaveBeenCalled();
		error.mockRestore();
	});
});
