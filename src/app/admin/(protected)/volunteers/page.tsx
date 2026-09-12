import Link from 'next/link';

import { getSlackMembers } from '@/data/slackMembers';
import { requirePermission, sessionCan } from '@/lib/adminAccess';
import { listVolunteers } from '@/lib/volunteers';
import { matchesState, parseVolunteerState } from './searchParams';
import { AddVolunteerForm } from './volunteerControls';
import { VolunteersTable } from './volunteersTable';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Volunteers · Admin',
	robots: { index: false, follow: false },
};

const EMPTY_MESSAGE = {
	active:
		'Nobody can send invites right now. Restart someone, or add a volunteer.',
	paused: 'Nobody has stepped back.',
	all: 'Add someone from Slack to let them start inviting people.',
} as const;

export default async function VolunteersPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const session = await requirePermission('volunteers', 'read');
	// The action re-checks; this only spares a read-only viewer a form that
	// would fail on submit.
	const canManage = sessionCan(session, 'volunteers', 'manage');

	const params = await searchParams;
	const state = parseVolunteerState(params);

	const [volunteers, members] = await Promise.all([
		listVolunteers(),
		getSlackMembers(),
	]);

	/**
	 * Filtered here rather than in SQL, unlike the queues.
	 *
	 * `listVolunteers()` already returns the whole roster in one query — it has
	 * to, because the chip counts below need every state — so filtering it again
	 * in Postgres would be a second round trip to narrow ninety rows that are
	 * already in memory.
	 */
	const rows = volunteers.filter((row) =>
		matchesState(state, row.deactivatedAt),
	);

	const activeCount = volunteers.filter(
		(row) => row.deactivatedAt === null,
	).length;

	const chips = [
		{ key: 'active', label: 'Active', count: activeCount },
		{ key: 'paused', label: 'Paused', count: volunteers.length - activeCount },
		{ key: 'all', label: 'Everything', count: volunteers.length },
	];

	const known = new Set(volunteers.map((row) => row.slackUserId));
	const candidates = members.map((member) => ({
		...member,
		alreadyVolunteer: known.has(member.id),
	}));

	const totalBalance = volunteers
		.filter((row) => row.deactivatedAt === null)
		.reduce((sum, row) => sum + row.balance, 0);

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<h1 className="h4 mb-1">Volunteers</h1>
			<p className="text-body-secondary">
				{activeCount} active, holding {totalBalance} invite
				{totalBalance === 1 ? '' : 's'} between them. Everyone active earns one
				more on the 1st of the month.
			</p>

			<div className="row g-4 mt-0">
				<div className="col-lg-8">
					<div
						className="btn-group mb-3"
						role="group"
						aria-label="Filter by state"
					>
						{chips.map((chip) => (
							<Link
								key={chip.key}
								href={`/admin/volunteers?state=${chip.key}`}
								className={`btn btn-sm ${
									state === chip.key ? 'btn-primary' : 'btn-outline-secondary'
								}`}
							>
								{chip.label}{' '}
								<span className="badge text-bg-light border ms-1">
									{chip.count}
								</span>
							</Link>
						))}
					</div>

					<VolunteersTable rows={rows} emptyMessage={EMPTY_MESSAGE[state]} />
				</div>

				{canManage && (
					<div className="col-lg-4">
						<AddVolunteerForm candidates={candidates} />
					</div>
				)}
			</div>
		</div>
	);
}
