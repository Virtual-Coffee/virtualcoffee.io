'use server';

import { redirect } from 'next/navigation';

import { redeemSlackInviteToken } from '@/lib/inviteTokens';
import { formValue } from '@/util/forms/parse';
import type { FormState } from '@/util/forms/types';

import { FAILURES } from './copy';

/**
 * Spends the single-use token and forwards to the workspace join link. This
 * is a POST from the button on /join-slack so that the GETs a mail client's
 * link scanner makes never consume the invite.
 */
export async function joinSlack(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	const code = formValue(formData, 'code');
	const joinLink = process.env.SLACK_JOIN_LINK;

	if (!code) return { is_error: true, message: FAILURES.unknown };
	if (!joinLink) {
		// Checked before redeeming, so a misconfigured deploy does not burn the
		// token.
		console.error(
			'SLACK_JOIN_LINK is not set; cannot complete a Slack invite.',
		);
		return { is_error: true, message: FAILURES.misconfigured };
	}

	const result = await redeemSlackInviteToken(code);
	if (!result.ok) return { is_error: true, message: FAILURES[result.reason] };

	redirect(joinLink);
}
