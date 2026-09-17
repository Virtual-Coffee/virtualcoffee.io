/**
 * The community roles a Volunteer can be tagged with — the Airtable `Roles`
 * table as it stood at the import. Descriptive only: they grant nothing (see
 * `volunteer.role_labels` in `src/db/schema.ts`). Alphabetical, and that order
 * is the one the column is written in.
 */
export const COMMUNITY_ROLES = [
	'Async Check-in Team',
	'AV Team',
	'Book Club Leader',
	'Coffee Table Group Coordinator',
	'Coffee Table Group Host',
	'Coffee Table Group Leader',
	'Documentation Team Lead',
	'Lightning Talks Organizer',
	'Lightning Talks Speaker',
	'Lightning Talks Volunteer',
	'Lunch & Learn Coordinator',
	'Lunch & Learn Speaker',
	'Lunch & Learn Team',
	'Monthly Challenge Team',
	'Notetaker',
	'Org Maintainer',
	'Room Leader',
	'VC Advisor',
	'VC Conference Organizer',
	'VC Conference Speaker',
	'VC Conference Volunteer',
	'VC Host',
	'VC Learning Cohort Leader',
	'VC Maintainer',
	'VC MC',
] as const;

export type CommunityRole = (typeof COMMUNITY_ROLES)[number];

/** `role_labels` is one comma-separated string; imported rows may hold names not in the list. */
export function parseRoleLabels(value: string | null): string[] {
	return (value ?? '')
		.split(',')
		.map((label) => label.trim())
		.filter(Boolean);
}

/**
 * Deduplicated, in `COMMUNITY_ROLES` order; `null` when nothing is picked.
 *
 * `current` is the column as stored: any name in it that is not on the list
 * (an import can carry one) is kept after the picked roles, because the
 * editor never offered it and so cannot have meant to remove it.
 */
export function formatRoleLabels(
	roles: readonly CommunityRole[],
	current: string | null = null,
): string | null {
	const picked: string[] = COMMUNITY_ROLES.filter((role) =>
		roles.includes(role),
	);
	const kept = new Set(
		parseRoleLabels(current).filter(
			(label) => !(COMMUNITY_ROLES as readonly string[]).includes(label),
		),
	);
	const all = [...picked, ...kept];
	return all.length > 0 ? all.join(', ') : null;
}
