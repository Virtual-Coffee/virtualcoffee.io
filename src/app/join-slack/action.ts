'use server';

import { redirect } from 'next/navigation';

import { redeemSlackInviteToken } from '@/lib/waitlist/inviteTokens';
import { formValue } from '@/util/forms/parse';
import type { FormState } from '@/util/forms/types';

import { FAILURES } from './copy';
import { slackJoinLink } from './joinLink';

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
	if (!code) return { is_error: true, message: FAILURES.unknown };

	// Checked before redeeming, so a misconfigured deploy does not burn the
	// token.
	const joinLink = slackJoinLink();
	if (!joinLink) return { is_error: true, message: FAILURES.misconfigured };

	const result = await redeemSlackInviteToken(code);
	if (!result.ok) return { is_error: true, message: FAILURES[result.reason] };

	redirect(joinLink);
}
