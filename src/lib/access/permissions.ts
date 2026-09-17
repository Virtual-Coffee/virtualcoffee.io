import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

/**
 * Access control for /admin.
 *
 * One resource per admin section, so a volunteer can be given one section
 * without being given the rest. `read` is enough to see a section and open its
 * detail views; `manage` is needed to change anything — that split is what
 * makes "let someone watch the queue without acting on it" expressible.
 *
 * `defaultStatements` carries Better Auth's own `user` and `session` resources.
 * They have to be spread in, or granting a custom role would silently drop the
 * built-in admin capabilities that /admin/user-management depends on.
 */
export const statement = {
	...defaultStatements,
	waitlist: ['read', 'manage'],
	coc: ['read', 'manage'],
	volunteerSignups: ['read', 'manage'],
	lunchAndLearn: ['read', 'manage'],
	coffeeTables: ['read', 'manage'],
	volunteers: ['read', 'manage'],
	admins: ['read', 'manage'],
} as const;

export const ac = createAccessControl(statement);

/** Every section a role can hold, in the order the nav renders them. */
export const SECTIONS = [
	'waitlist',
	'coc',
	'volunteerSignups',
	'lunchAndLearn',
	'coffeeTables',
	'volunteers',
	'admins',
] as const;

export type Section = (typeof SECTIONS)[number];

/**
 * A full maintainer. Holds every section including `coc`, plus Better Auth's
 * own admin statements — without `adminAc.statements` the ban, impersonate and
 * set-role endpoints reject them.
 */
export const admin = ac.newRole({
	...adminAc.statements,
	waitlist: ['read', 'manage'],
	coc: ['read', 'manage'],
	volunteerSignups: ['read', 'manage'],
	lunchAndLearn: ['read', 'manage'],
	coffeeTables: ['read', 'manage'],
	volunteers: ['read', 'manage'],
	admins: ['read', 'manage'],
});

/** The default for anyone who signs in with Slack but has been granted nothing. */
export const user = ac.newRole({});

/**
 * Someone trusted to give out Invites. Grants no Section on purpose: /invites
 * lives outside /admin and asks `requireVolunteer()` for this role by name.
 * See docs/adr/0010.
 */
export const volunteer = ac.newRole({});

/**
 * Narrow roles, one per section, for maintainers helping with a single area.
 *
 * None of these are listed in the admin plugin's `adminRoles`: holding one
 * gets you into /admin and into your own section, and nothing else. A
 * volunteer_coordinator must not be able to ban or impersonate users.
 */
export const waitlist_reviewer = ac.newRole({
	waitlist: ['read', 'manage'],
});

export const coc_reviewer = ac.newRole({
	coc: ['read', 'manage'],
});

export const volunteer_coordinator = ac.newRole({
	volunteerSignups: ['read', 'manage'],
});

export const lunch_and_learn_organizer = ac.newRole({
	lunchAndLearn: ['read', 'manage'],
});

export const coffee_table_organizer = ac.newRole({
	coffeeTables: ['read', 'manage'],
});

export const roles = {
	admin,
	user,
	volunteer,
	waitlist_reviewer,
	coc_reviewer,
	volunteer_coordinator,
	lunch_and_learn_organizer,
	coffee_table_organizer,
};

export type RoleName = keyof typeof roles;

/** A label for every role, including the ones User Management does not grant. */
export const ROLE_LABELS: Record<RoleName, string> = {
	admin: 'Admin',
	user: 'No access',
	volunteer: 'Volunteer',
	waitlist_reviewer: 'Waitlist reviewer',
	coc_reviewer: 'CoC reviewer',
	volunteer_coordinator: 'Volunteer coordinator',
	lunch_and_learn_organizer: 'Lunch & Learn organiser',
	coffee_table_organizer: 'Coffee Table organiser',
};

/**
 * Roles that can be granted in /admin/user-management.
 *
 * `user` is the default and is what revoking everything leaves behind.
 * `volunteer` is granted from /admin/volunteers, which writes the `volunteer`
 * row in the same transaction; offering it here would be a second way to make
 * half a Volunteer.
 */
export const GRANTABLE_ROLES = [
	{ name: 'admin', description: 'Full access to every section' },
	{
		name: 'waitlist_reviewer',
		description: 'The membership queue and archive',
	},
	{ name: 'coc_reviewer', description: 'Code of Conduct reports' },
	{ name: 'volunteer_coordinator', description: 'Volunteer signups' },
	{ name: 'lunch_and_learn_organizer', description: 'Lunch & Learn ideas' },
	{
		name: 'coffee_table_organizer',
		description: 'Coffee Table group requests',
	},
] as const satisfies ReadonlyArray<{ name: RoleName; description: string }>;

/**
 * Checked on the server, not just used to render the checkboxes: a role that is
 * granted elsewhere has to be un-settable here, or a forged request — or the
 * "Revoke all" item, which sends an empty set — would strip it. See
 * `preserveUngrantedRoles` in that screen's actions.
 */
export const GRANTABLE_ROLE_NAMES: ReadonlySet<RoleName> = new Set(
	GRANTABLE_ROLES.map((role) => role.name),
);

export const DEFAULT_ROLE = 'user';

/**
 * Better Auth stores roles as a comma-separated string in `user.role` and
 * authorises if *any* of them grants the permission (`hasPermission` in
 * `better-auth/plugins/admin` splits on ","). These two are the only places
 * that encoding is known about.
 *
 * `parseRoles` drops the default: `user` grants nothing, so "holds nothing" is
 * `parseRoles(role).length === 0`. `serialiseRoles` writes it back for an
 * empty set, because the column is what Better Auth reads.
 */
export function parseRoles(role: string | null | undefined): RoleName[] {
	if (!role) return [];
	return role
		.split(',')
		.map((entry) => entry.trim())
		.filter(isRoleName);
}

/** A Role that grants something — never the default. */
export function isRoleName(value: string): value is RoleName {
	return Object.hasOwn(roles, value) && value !== DEFAULT_ROLE;
}

export function serialiseRoles(names: readonly RoleName[]): string {
	const unique = [...new Set(names)].filter((name) => name !== DEFAULT_ROLE);
	return unique.length > 0 ? unique.join(',') : DEFAULT_ROLE;
}
