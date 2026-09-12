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
	dashboard: ['read'],
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
 * Someone trusted to give out Invites. Grants no Section at all, deliberately.
 *
 * This looks like a mistake and is not. A Volunteer has no business in /admin:
 * `visibleSections()` is empty for them, so `requireSession()` turns them away
 * exactly as it turns away anyone holding nothing. What the role buys is a
 * *name* — `grantedRoles()` reports it, so User Management can show that this
 * person holds something, Pending Grants pre-provision it like any other role,
 * and `requireVolunteer()` in `volunteerAccess.ts` has one thing to ask about.
 *
 * The alternative was a Section for /invites, which would have put a
 * volunteer-facing page inside the admin boundary — and inside
 * `adminRoutesEnabled()`, which 404s that whole tree on deploy previews. See
 * docs/adr/0010.
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
	volunteer,
	waitlist_reviewer,
	coc_reviewer,
	volunteer_coordinator,
	lunch_and_learn_organizer,
	coffee_table_organizer,
};

export type RoleName = keyof typeof roles;

/**
 * A label for every role, including the ones nobody grants from User
 * Management.
 *
 * `GRANTABLE_ROLES` below is the picker's list, and reading labels off it means
 * any role missing from it renders as a blank badge. `volunteer` is exactly
 * that: it is granted from /admin/volunteers, because a Volunteer needs a
 * `volunteer` row as well as the role and creating one without the other
 * produces someone who can spend nothing or someone who accrues invites they
 * cannot reach.
 */
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
 * Roles that can be granted in /admin/user-management, with the label the
 * UI shows.
 *
 * `user` is excluded: it is the default, and is what revoking everything
 * leaves behind rather than something anyone is given. `volunteer` is excluded
 * for a different reason — it is granted from /admin/volunteers, which creates
 * the `volunteer` row in the same transaction. Offering it here as well would
 * be a second way to make half a Volunteer.
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

/**
 * The role names /admin/user-management is allowed to set.
 *
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
 * `better-auth/plugins/admin` splits on ","). These helpers are the only
 * places that encoding is known about.
 */
export function parseRoles(role: string | null | undefined): RoleName[] {
	if (!role) return [];
	return role
		.split(',')
		.map((entry) => entry.trim())
		.filter((entry): entry is RoleName => Object.hasOwn(roles, entry));
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
