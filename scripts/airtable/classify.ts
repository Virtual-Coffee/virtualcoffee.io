import type { ApplicationSource, ApplicationStatus } from '../../src/db';

/**
 * How an Airtable membership row maps onto an application status.
 *
 * Apart from `importMembership.ts` because that script runs on import; this
 * is the decision tree worth testing.
 */

export function str(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export function date(value: unknown): Date | null {
	const raw = str(value);
	if (!raw) return null;
	const parsed = new Date(raw);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function bool(value: unknown): boolean {
	return value === true;
}

export type Classified = {
	status: ApplicationStatus;
	source: ApplicationSource;
	coffeeInvitedAt: Date | null;
	approvedAt: Date | null;
};

export function classify(
	fields: Record<string, unknown>,
	cutoff: Date,
): Classified {
	const sourceName = str(
		typeof fields.Source === 'object' && fields.Source !== null
			? (fields.Source as { name?: string }).name
			: fields.Source,
	);
	const source: ApplicationSource =
		sourceName === 'Volunteer Invite' ? 'volunteer_invite' : 'waitlist_signup';

	const approved = bool(fields.approved);
	const onWaitingList = bool(fields['On Waiting List']);
	const fromWaitlistAt = date(fields.from_waitinglist_at);
	const approvedAt = date(fields.approved_at);

	// `approved` is the second approval (membership granted). Note that 553 of
	// the 1,099 approved rows predate the `approved_at` field, so the timestamp
	// is frequently null even when the flag is set — don't infer from its
	// absence.
	if (approved) {
		return {
			status: 'member',
			source,
			coffeeInvitedAt: fromWaitlistAt,
			approvedAt,
		};
	}

	if (onWaitingList) {
		return {
			status: 'waitlisted',
			source,
			coffeeInvitedAt: null,
			approvedAt: null,
		};
	}

	if (fromWaitlistAt && fromWaitlistAt >= cutoff) {
		return {
			status: 'coffee_invited',
			source,
			coffeeInvitedAt: fromWaitlistAt,
			approvedAt: null,
		};
	}

	return {
		status: 'lapsed',
		source,
		coffeeInvitedAt: fromWaitlistAt,
		approvedAt: null,
	};
}
