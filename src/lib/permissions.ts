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
	dashboard: ['read'],
	waitlist: ['read', 'manage'],
	coc: ['read', 'manage'],
	volunteerSignups: ['read', 'manage'],
	lunchAndLearn: ['read', 'manage'],
	coffeeTables: ['read', 'manage'],
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
	dashboard: ['read'],
	waitlist: ['read', 'manage'],
	coc: ['read', 'manage'],
	volunteerSignups: ['read', 'manage'],
	lunchAndLearn: ['read', 'manage'],
	coffeeTables: ['read', 'manage'],
	admins: ['read', 'manage'],
});

/** The default for anyone who signs in with Slack but has been granted nothing. */
export const user = ac.newRole({});

/**
 * Narrow roles, one per section, for volunteers helping with a single area.
 *
 * None of these are listed in the admin plugin's `adminRoles`: holding one
 * gets you into /admin and into your own section, and nothing else. A
 * volunteer_coordinator must not be able to ban or impersonate users.
 */
export const waitlist_reviewer = ac.newRole({
	dashboard: ['read'],
	waitlist: ['read', 'manage'],
});

export const coc_reviewer = ac.newRole({
	dashboard: ['read'],
	coc: ['read', 'manage'],
});

export const volunteer_coordinator = ac.newRole({
	dashboard: ['read'],
	volunteerSignups: ['read', 'manage'],
});

export const lunch_and_learn_organizer = ac.newRole({
	dashboard: ['read'],
	lunchAndLearn: ['read', 'manage'],
});

export const coffee_table_organizer = ac.newRole({
	dashboard: ['read'],
	coffeeTables: ['read', 'manage'],
});

export const roles = {
	admin,
	user,
	waitlist_reviewer,
	coc_reviewer,
	volunteer_coordinator,
	lunch_and_learn_organizer,
	coffee_table_organizer,
};

export type RoleName = keyof typeof roles;

/**
 * Roles that can be granted in /admin/user-management, with the label the
 * UI shows.
 * `user` is excluded: it is the default, and is what revoking everything
 * leaves behind rather than something anyone is given.
 */
export const GRANTABLE_ROLES = [
	{
		name: 'admin',
		label: 'Admin',
		description: 'Full access to every section',
	},
	{
		name: 'waitlist_reviewer',
		label: 'Waitlist reviewer',
		description: 'The membership queue and archive',
	},
	{
		name: 'coc_reviewer',
		label: 'CoC reviewer',
		description: 'Code of Conduct reports',
	},
	{
		name: 'volunteer_coordinator',
		label: 'Volunteer coordinator',
		description: 'Volunteer signups',
	},
	{
		name: 'lunch_and_learn_organizer',
		label: 'Lunch & Learn organiser',
		description: 'Lunch & Learn ideas',
	},
	{
		name: 'coffee_table_organizer',
		label: 'Coffee Table organiser',
		description: 'Coffee Table group requests',
	},
] as const satisfies ReadonlyArray<{
	name: RoleName;
	label: string;
	description: string;
}>;

export const DEFAULT_ROLE = 'user';

/**
 * Better Auth stores roles as a comma-separated string in `user.role` and
 * authorises if *any* of them grants the permission (`hasPermission` in
 * `better-auth/plugins/admin` splits on ","). These helpers are the only
 * places that encoding is known about.
 */
export function parseRoles(role: string | null | undefined): RoleName[] {
	if (!role) return [];
	return role
		.split(',')
		.map((entry) => entry.trim())
		.filter((entry): entry is RoleName => entry in roles);
}

export function serialiseRoles(names: readonly RoleName[]): string {
	const unique = [...new Set(names)].filter((name) => name !== DEFAULT_ROLE);
	return unique.length > 0 ? unique.join(',') : DEFAULT_ROLE;
}

/**
 * The roles that actually grant something.
 *
 * `serialiseRoles` writes the default role for an empty selection, but
 * `parseRoles` reads it straight back as a role like any other — so
 * `parseRoles('user')` is `['user']`, not `[]`, and "holds nothing" is not
 * `parseRoles(...).length === 0`. Ask through here instead: `user` is
 * `ac.newRole({})` and grants nothing, so it never belongs in a list of what
 * someone can do.
 */
export function grantedRoles(role: string | null | undefined): RoleName[] {
	return parseRoles(role).filter((name) => name !== DEFAULT_ROLE);
}
