import { serialiseRoles } from '@/lib/permissions';
import {
	insertDevtoolsUser,
	insertPendingGrant,
	insertUser,
} from '@/test/db/fixtures';

import {
	ADMIN,
	COC_REVIEWER,
	PENDING_GRANT_SLACK_ID,
	STRANDED,
	VOLUNTEER,
	daysAgo,
} from './shared';

/**
 * Users, Pending Grants, and the devtools panel's view of them.
 *
 * `devBypassSession()` synthesizes its session in memory and never touches
 * the database, so without the `dev-bypass` row the identity every local
 * admin action is performed as never appears in User Management, and
 * `actorId()` finds nobody to attribute the action to. The seeded `role` is
 * cosmetic for the bypass — `requirePermission()` authorizes off
 * `ADMIN_DEV_BYPASS_ROLES` — but real for a devtools switch, which mints a
 * genuine session for the row.
 *
 * The three role-holding users are registered with the devtools panel so
 * "switch user" offers an admin, a Volunteer with an allowance and a CoC
 * reviewer without anyone creating them by hand.
 */
export async function seedUsers() {
	await insertUser({
		id: ADMIN.id,
		name: ADMIN.name,
		email: ADMIN.email,
		emailVerified: true,
		// `volunteer` as well, because `seedVolunteers()` gives this identity a
		// `volunteer` row and a row without the role is the broken state
		// /admin/volunteers exists to prevent.
		role: serialiseRoles(['admin', 'volunteer']),
		slackUserId: ADMIN.slackUserId,
		roleGrantedBy: 'Seed script',
		roleGrantedAt: daysAgo(30),
	});
	await insertUser({
		id: VOLUNTEER.id,
		name: VOLUNTEER.name,
		email: VOLUNTEER.email,
		emailVerified: true,
		role: serialiseRoles(['volunteer']),
		slackUserId: VOLUNTEER.slackUserId,
		roleGrantedBy: ADMIN.name,
		roleGrantedAt: daysAgo(45),
	});
	await insertUser({
		id: COC_REVIEWER.id,
		name: COC_REVIEWER.name,
		email: COC_REVIEWER.email,
		emailVerified: true,
		role: serialiseRoles(['coc_reviewer']),
		slackUserId: COC_REVIEWER.slackUserId,
		roleGrantedBy: ADMIN.name,
		roleGrantedAt: daysAgo(12),
	});
	await insertUser({
		id: STRANDED.id,
		name: STRANDED.name,
		email: STRANDED.email,
		emailVerified: true,
		role: serialiseRoles([]),
		slackUserId: STRANDED.slackUserId,
	});

	// Unclaimed: the ordinary case, waiting for a first sign-in.
	await insertPendingGrant({
		slackUserId: PENDING_GRANT_SLACK_ID,
		slackDisplayName: 'Priya Fernandez',
		slackHandle: 'priyaf',
		role: serialiseRoles(['coc_reviewer', 'volunteer_coordinator']),
		grantedBy: ADMIN.name,
		grantedAt: daysAgo(5),
	});
	// Stranded: see `STRANDED`.
	await insertPendingGrant({
		slackUserId: STRANDED.slackUserId,
		slackDisplayName: STRANDED.name,
		slackHandle: 'jlee',
		role: serialiseRoles(['admin']),
		grantedBy: ADMIN.name,
		grantedAt: daysAgo(20),
	});
	// Claimed: kept as the record of who pre-provisioned whom.
	await insertPendingGrant({
		slackUserId: COC_REVIEWER.slackUserId,
		slackDisplayName: COC_REVIEWER.name,
		slackHandle: 'marcusw',
		role: serialiseRoles(['coc_reviewer']),
		grantedBy: ADMIN.name,
		grantedAt: daysAgo(14),
		claimedAt: daysAgo(12),
		claimedUserId: COC_REVIEWER.id,
	});

	for (const [templateKey, person] of [
		['admin', ADMIN],
		['volunteer', VOLUNTEER],
		['coc_reviewer', COC_REVIEWER],
	] as const) {
		await insertDevtoolsUser({
			id: `seed-devtools-${templateKey}`,
			userId: person.id,
			templateKey,
			label: `${person.name} (seeded ${templateKey})`,
			email: `${templateKey}+seed@test.local`,
		});
	}
}
