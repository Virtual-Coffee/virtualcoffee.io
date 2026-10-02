import { and, eq, isNull, sql } from 'drizzle-orm';

import { db, pendingGrant, user, volunteer, type Transaction } from '@/db';
import {
	GRANTABLE_ROLE_NAMES,
	parseRoles,
	serialiseRoles,
	type RoleName,
} from '@/lib/access/permissions';
import { reportHandled } from '@/lib/monitoring/reportHandled';

/**
 * Role assignment: every write to `user.role` and `pending_grant`. A Role
 * lands directly on a user who has signed in, otherwise as a Pending Grant
 * applied at their first sign-in (docs/adr/0009). Each operation takes the
 * caller's transaction, locks the Slack member, and reads only under that lock,
 * so a first sign-in cannot land between a read and the write that depends on it.
 */

/** Who is assigning; `userId` is absent for the Airtable import, which has no session. */
export type Actor = { userId?: string; name: string };

type Refusal =
	| 'self-demotion'
	| 'holds-volunteer'
	| 'already-has-roles'
	| 'already-pending'
	| 'empty';

/**
 * `applied`: written to a user. `pending`: the change landed on a Pending Grant
 * (inserted, updated or withdrawn). `stale`: the user or Grant is gone or
 * already claimed. `changed`: the person is still there but their row moved
 * under the edit (a sign-in gave them a Slack id), so the caller's view is old. `name` is the person's, for copy that names them.
 */
export type Outcome =
	| { kind: 'applied'; userId: string; name?: string }
	| { kind: 'pending'; grantId: string }
	| { kind: 'stale' }
	| { kind: 'changed' }
	| { kind: 'refused'; reason: Refusal; name?: string };

type SlackMemberRef = {
	slackUserId: string;
	slackDisplayName: string;
	slackHandle: string | null;
};

/**
 * Slack member ids that become admins the first time they sign in.
 *
 * Bootstrap only, and really only for the very first admin — there is nobody to
 * create a Pending Grant on an empty database. Once someone is an admin, roles
 * are granted and revoked in /admin and live in the database; removing an id
 * here revokes nothing.
 *
 * Read at call time rather than module scope so a changed environment variable
 * takes effect without a restart.
 */
function bootstrapAdminSlackIds(): Set<string> {
	return new Set(
		(process.env.ADMIN_BOOTSTRAP_SLACK_IDS ?? '')
			.split(',')
			.map((entry) => entry.trim())
			.filter(Boolean),
	);
}

type RoleUpdate = {
	role: string;
	roleGrantedBy: string;
	roleGrantedAt: Date;
};

function withVolunteerRole(current: string | null | undefined): string {
	return serialiseRoles([
		...new Set<RoleName>([...parseRoles(current), 'volunteer']),
	]);
}

function withoutVolunteerRole(current: string | null | undefined): string {
	return serialiseRoles(parseRoles(current).filter((r) => r !== 'volunteer'));
}

/**
 * Carry over any role User Management does not grant.
 *
 * Its dropdown replaces the whole set rather than toggling one role, which is
 * what keeps the server from merging a stale client view — but an empty
 * selection would silently revoke a role granted elsewhere. `volunteer` is
 * granted from /admin/volunteers alongside a `volunteer` row; dropping it here
 * would leave that row active and accruing invites its owner can no longer spend.
 */
function preserveUngrantedRoles(
	current: string | null | undefined,
	requested: RoleName[],
): RoleName[] {
	const kept = parseRoles(current).filter(
		(role) => !GRANTABLE_ROLE_NAMES.has(role),
	);
	return [...new Set([...requested, ...kept])];
}

/**
 * Serialise every assignment for one Slack member. The operations are
 * check-then-writes and `claimOnSignIn` reads what they wrote; without this a
 * first sign-in landing between the check and the write leaves a Grant nothing
 * will ever claim. Transaction-scoped, so it releases with the transaction; a
 * lock rather than `FOR UPDATE` because the row being raced on may not exist
 * yet. Held until commit.
 */
const SLACK_MEMBER_LOCK = 0x5143;

function lockSlackMember(tx: Transaction, slackUserId: string) {
	return tx.execute(
		sql`select pg_advisory_xact_lock(${SLACK_MEMBER_LOCK}, hashtext(${slackUserId}))`,
	);
}

/** The one Grant nobody has claimed for this Slack member, if there is one. */
async function findUnclaimedGrant(tx: Transaction, slackUserId: string) {
	const [grant] = await tx
		.select()
		.from(pendingGrant)
		.where(
			and(
				eq(pendingGrant.slackUserId, slackUserId),
				isNull(pendingGrant.claimedAt),
			),
		)
		.limit(1);

	return grant ?? null;
}

async function findUserBySlackId(tx: Transaction, slackUserId: string) {
	const [row] = await tx
		.select({ id: user.id, name: user.name, role: user.role })
		.from(user)
		.where(eq(user.slackUserId, slackUserId))
		.limit(1);

	return row ?? null;
}

async function findUnclaimedGrantById(tx: Transaction, grantId: string) {
	const [grant] = await tx
		.select()
		.from(pendingGrant)
		.where(and(eq(pendingGrant.id, grantId), isNull(pendingGrant.claimedAt)))
		.limit(1);

	return grant ?? null;
}

/** Record that `userId` now holds what the Grant carried. */
function claimGrant(tx: Transaction, grantId: string, userId: string) {
	return tx
		.update(pendingGrant)
		.set({ claimedAt: new Date(), claimedUserId: userId })
		.where(eq(pendingGrant.id, grantId));
}

async function readUser(tx: Transaction, userId: string) {
	const [row] = await tx
		.select({ role: user.role, slackUserId: user.slackUserId })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	return row ?? null;
}

/**
 * Replace someone's roles outright, keeping the ones User Management does not
 * grant. A Grant beside a signed-in user is one their first sign-in failed to
 * claim; this edit is the recovery, so its roles join what is carried over and
 * it is claimed — or withdrawn on "revoke all", since it never took effect.
 *
 * Refuses to drop the actor's own admin: the UI hides the control, but a forged
 * request would otherwise let the last admin lock everyone out.
 */
export async function replaceRoles(
	tx: Transaction,
	userId: string,
	requested: RoleName[],
	by: Actor,
): Promise<Outcome> {
	const first = await readUser(tx, userId);
	if (!first) return { kind: 'stale' };

	// Read again under the lock; the Slack id is what there is to lock on.
	let target = first;
	let grant = null;
	if (first.slackUserId) {
		await lockSlackMember(tx, first.slackUserId);
		const locked = await readUser(tx, userId);
		if (!locked) return { kind: 'stale' };
		if (locked.slackUserId !== first.slackUserId) return { kind: 'changed' };
		target = locked;
		grant = await findUnclaimedGrant(tx, first.slackUserId);
	}

	if (
		by.userId === userId &&
		parseRoles(target.role).includes('admin') &&
		!requested.includes('admin')
	) {
		return { kind: 'refused', reason: 'self-demotion' };
	}

	const resulting = preserveUngrantedRoles(
		[target.role, grant?.role].filter(Boolean).join(','),
		requested,
	);
	const granting = resulting.length > 0;

	// Without a Slack id there is no lock to take, so the write is pinned to
	// still having none: a first sign-in landing since the read gives it one,
	// and `claimOnSignIn` may have applied roles this would overwrite.
	const updated = await tx
		.update(user)
		.set({
			role: serialiseRoles(resulting),
			roleGrantedAt: granting ? new Date() : null,
			roleGrantedBy: granting ? by.name : null,
		})
		.where(
			and(
				eq(user.id, userId),
				first.slackUserId ? undefined : isNull(user.slackUserId),
			),
		);
	if (updated.rowCount === 0) return { kind: 'changed' };

	if (grant) {
		// Claimed only if something was applied; a claimed Grant is the record of
		// who granted what, so a revoke-all withdraws it instead.
		if (granting) await claimGrant(tx, grant.id, userId);
		else await tx.delete(pendingGrant).where(eq(pendingGrant.id, grant.id));
	}

	return { kind: 'applied', userId };
}

/**
 * Give roles to a Slack member: directly on their user if they have signed in
 * holding nothing, otherwise as a Pending Grant carrying a snapshot of their
 * name. Someone already holding a role is edited with `replaceRoles` instead.
 */
export async function grantToSlackMember(
	tx: Transaction,
	member: SlackMemberRef,
	requested: RoleName[],
	by: Actor,
): Promise<Outcome> {
	if (requested.length === 0) return { kind: 'refused', reason: 'empty' };

	await lockSlackMember(tx, member.slackUserId);

	const existing = await findUserBySlackId(tx, member.slackUserId);

	if (existing && parseRoles(existing.role).length > 0) {
		return {
			kind: 'refused',
			reason: 'already-has-roles',
			name: existing.name,
		};
	}

	// A stranded user is in the table too, with the Grant that failed to apply;
	// it is edited there, which applies the Grant.
	if (await findUnclaimedGrant(tx, member.slackUserId)) {
		return { kind: 'refused', reason: 'already-pending' };
	}

	if (existing) {
		await tx
			.update(user)
			.set({
				role: serialiseRoles(requested),
				roleGrantedAt: new Date(),
				roleGrantedBy: by.name,
			})
			.where(eq(user.id, existing.id));

		return { kind: 'applied', userId: existing.id, name: existing.name };
	}

	const [created] = await tx
		.insert(pendingGrant)
		.values({
			slackUserId: member.slackUserId,
			slackDisplayName: member.slackDisplayName,
			slackHandle: member.slackHandle,
			role: serialiseRoles(requested),
			grantedBy: by.name,
		})
		.returning({ id: pendingGrant.id });

	return { kind: 'pending', grantId: created.id };
}

/**
 * Lock the Slack member behind a Grant id and read the Grant under the lock.
 * The Slack id has to be read first to know what to lock, so it is read twice.
 */
async function lockGrant(tx: Transaction, grantId: string) {
	const first = await findUnclaimedGrantById(tx, grantId);
	if (!first) return null;

	await lockSlackMember(tx, first.slackUserId);
	return findUnclaimedGrantById(tx, grantId);
}

/** Change the roles on a Grant nobody has claimed yet. */
export async function setGrantRoles(
	tx: Transaction,
	grantId: string,
	requested: RoleName[],
): Promise<Outcome> {
	const grant = await lockGrant(tx, grantId);
	if (!grant) return { kind: 'stale' };

	// Judged on what would be stored, not what was asked for: a Volunteer's
	// grant with its last grantable role unticked still holds `volunteer`.
	const resulting = preserveUngrantedRoles(grant.role, requested);
	if (resulting.length === 0) return { kind: 'refused', reason: 'empty' };

	await tx
		.update(pendingGrant)
		.set({ role: serialiseRoles(resulting) })
		.where(eq(pendingGrant.id, grantId));

	return { kind: 'pending', grantId };
}

/**
 * Withdraw a Grant nobody has claimed. A hard delete: it never took effect.
 * Claimed Grants are never deleted — they are the record of who granted whom.
 */
export async function withdrawGrant(
	tx: Transaction,
	grantId: string,
): Promise<Outcome> {
	const grant = await lockGrant(tx, grantId);
	if (!grant) return { kind: 'stale' };

	// "Revoke all" reaches this rather than `setGrantRoles`, so it is the one
	// path that could delete `volunteer`, which belongs to a `volunteer` row
	// written in the same transaction as the Grant.
	if (parseRoles(grant.role).includes('volunteer')) {
		return { kind: 'refused', reason: 'holds-volunteer' };
	}

	await tx.delete(pendingGrant).where(eq(pendingGrant.id, grantId));
	return { kind: 'pending', grantId };
}

/**
 * Give someone the `volunteer` role, the way access is always given: directly
 * on the user if they have signed in, otherwise as a Pending Grant that
 * `claimOnSignIn()` applies at their first sign-in.
 *
 * Takes the caller's transaction because the role is only half of a Volunteer:
 * the caller is also writing the `volunteer` row (docs/adr/0010). Safe to
 * repeat: an existing role string or Grant is merged into, not duplicated.
 */
export async function addVolunteerRole(
	tx: Transaction,
	member: SlackMemberRef,
	by: Actor,
): Promise<Outcome> {
	await lockSlackMember(tx, member.slackUserId);

	const existing = await findUserBySlackId(tx, member.slackUserId);

	// A Grant may already exist from User Management; the partial unique index
	// allows only one unclaimed Grant per Slack member, so it is added to.
	const grant = await findUnclaimedGrant(tx, member.slackUserId);

	if (existing) {
		// A Grant beside a signed-in user is one their first sign-in failed to
		// claim. It is applied here along with `volunteer`: adding a role would
		// otherwise clear the "Grant not applied" badge while leaving the Grant
		// unclaimed and the roles it carried hidden.
		await tx
			.update(user)
			.set({
				role: serialiseRoles([
					...parseRoles(existing.role),
					...parseRoles(grant?.role),
					'volunteer',
				]),
				roleGrantedAt: new Date(),
				roleGrantedBy: by.name,
			})
			.where(eq(user.id, existing.id));

		if (grant) await claimGrant(tx, grant.id, existing.id);
		return { kind: 'applied', userId: existing.id, name: existing.name };
	}

	if (grant) {
		await tx
			.update(pendingGrant)
			.set({ role: withVolunteerRole(grant.role) })
			.where(eq(pendingGrant.id, grant.id));
		return { kind: 'pending', grantId: grant.id };
	}

	const [created] = await tx
		.insert(pendingGrant)
		.values({
			slackUserId: member.slackUserId,
			slackDisplayName: member.slackDisplayName,
			slackHandle: member.slackHandle,
			role: serialiseRoles(['volunteer']),
			grantedBy: by.name,
		})
		.returning({ id: pendingGrant.id });

	return { kind: 'pending', grantId: created.id };
}

/**
 * Take the `volunteer` role away, the inverse of `addVolunteerRole`: off the
 * user if they have signed in, and off any Grant still waiting for them.
 * `stale` when they held it nowhere.
 */
export async function removeVolunteerRole(
	tx: Transaction,
	slackUserId: string,
): Promise<Outcome> {
	await lockSlackMember(tx, slackUserId);

	const account = await findUserBySlackId(tx, slackUserId);

	if (account) {
		// `roleGrantedAt/By` record who gave access and when. Taking a role away
		// leaves those alone; only a grant is a grant.
		await tx
			.update(user)
			.set({ role: withoutVolunteerRole(account.role) })
			.where(eq(user.id, account.id));
	}

	const grant = await findUnclaimedGrant(tx, slackUserId);
	if (grant) {
		const role = withoutVolunteerRole(grant.role);
		// A Grant that would carry nothing is withdrawn: it never took effect,
		// and an empty Grant is one `setGrantRoles` refuses to write.
		if (parseRoles(role).length === 0) {
			await tx.delete(pendingGrant).where(eq(pendingGrant.id, grant.id));
		} else {
			await tx
				.update(pendingGrant)
				.set({ role })
				.where(eq(pendingGrant.id, grant.id));
		}
	}

	if (account)
		return { kind: 'applied', userId: account.id, name: account.name };
	if (grant) return { kind: 'pending', grantId: grant.id };
	return { kind: 'stale' };
}

/**
 * Copy the Slack member id onto the user and apply any Pending Grant
 * for it. Called from `databaseHooks.account.create.after` (docs/adr/0009).
 *
 * Deliberately never throws: a failed claim must not fail sign-in. The grant
 * stays unclaimed and `listAccessRows()` surfaces the person anyway. Returns
 * `false` for that case so a test can see it; the sign-in hook ignores it.
 */
export async function claimOnSignIn(account: {
	providerId: string;
	accountId: string;
	userId: string;
}): Promise<boolean> {
	if (account.providerId !== 'slack') return true;

	try {
		/**
		 * The Slack member id goes on first, in its own statement, so that a
		 * claim that fails below still leaves the person findable: the recovery
		 * join in `listAccessRows()` and every "has this Slack member signed
		 * in?" check key on this column. Inside the transaction it would roll
		 * back with the claim and strand them where nothing can see them.
		 */
		await db()
			.update(user)
			.set({ slackUserId: account.accountId })
			.where(eq(user.id, account.userId));

		await db().transaction(async (tx) => {
			await lockSlackMember(tx, account.accountId);

			const [existing] = await tx
				.select({ role: user.role })
				.from(user)
				.where(eq(user.id, account.userId))
				.limit(1);

			if (!existing) return;

			/**
			 * Only ever grants, never revokes. `account.create` also fires when an
			 * account is linked to a user that already exists, and rewriting the
			 * roles of someone a maintainer has already given access to — from an
			 * environment variable, or from a grant that predates that decision —
			 * would be a silent demotion.
			 */
			const holdsNothing = parseRoles(existing.role).length === 0;

			let roleUpdate: RoleUpdate | null = null;
			let claimedGrantId: string | null = null;

			if (holdsNothing) {
				const grant = await findUnclaimedGrant(tx, account.accountId);

				// Both can apply at once — a bootstrap admin who was also given
				// `volunteer` from /admin/volunteers before signing in. The grant is
				// claimed either way, or it would sit unclaimed forever and show as
				// stranded in User Management.
				const bootstrapAdmin = bootstrapAdminSlackIds().has(account.accountId);
				const granted: RoleName[] = [
					...(bootstrapAdmin ? (['admin'] as const) : []),
					...parseRoles(grant?.role),
				];

				if (grant) {
					claimedGrantId = grant.id;
					roleUpdate = {
						role: serialiseRoles(granted),
						/**
						 * The grantor and the moment they decided, not the moment this
						 * person got round to signing in. "Granted" then means the same
						 * thing in the User Management table whether access was
						 * a Pending Grant or set after the fact.
						 */
						roleGrantedBy: grant.grantedBy,
						roleGrantedAt: grant.grantedAt,
					};
				} else if (bootstrapAdmin) {
					roleUpdate = {
						role: serialiseRoles(granted),
						roleGrantedBy: 'ADMIN_BOOTSTRAP_SLACK_IDS',
						roleGrantedAt: new Date(),
					};
				}
			}

			if (roleUpdate) {
				await tx
					.update(user)
					.set(roleUpdate)
					.where(eq(user.id, account.userId));
			}

			if (claimedGrantId) {
				await claimGrant(tx, claimedGrantId, account.userId);
			}

			/**
			 * A Volunteer may have been designated — and carry an imported balance —
			 * long before this moment. The `volunteer` row is keyed on the Slack
			 * member id precisely so that it can exist first; this is the point at
			 * which it can finally learn the user id.
			 *
			 * Unconditional, not gated on `holdsNothing`: linking a row to its
			 * owner is not a grant, and someone who already had access can still be
			 * signing in with Slack for the first time.
			 */
			await tx
				.update(volunteer)
				.set({ userId: account.userId })
				.where(eq(volunteer.slackUserId, account.accountId));
		});
	} catch (error) {
		console.error('Failed to claim a Pending Grant', {
			slackUserId: account.accountId,
			error,
		});
		reportHandled(error, { area: 'access' });
		return false;
	}
	return true;
}
