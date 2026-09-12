'use client';

import Link from 'next/link';

import type { MembershipApplication } from '@/db';
import { useModalDialog } from '@/util/useModalDialog';
import { Answer, SourceBadge, StatusBadge, formatDate } from '../presentation';

/**
 * A native <dialog>, so Escape-to-close, focus trapping and making the page
 * behind it inert all come from the platform. Bootstrap's offcanvas would need
 * Bootstrap's JavaScript, which this project doesn't load.
 *
 * Clicking the backdrop is the one thing the platform does not give us — see
 * `useModalDialog`.
 */
export function ApplicationDrawer({
	application,
	onClose,
}: {
	application: MembershipApplication | null;
	onClose: () => void;
}) {
	const dialog = useModalDialog(application !== null, onClose);

	return (
		<dialog {...dialog} className="admin-drawer">
			{application && (
				<div className="d-flex flex-column h-100">
					<div className="d-flex justify-content-between align-items-start gap-3 p-3 border-bottom">
						<div>
							<h2 className="h5 mb-1">{application.name}</h2>
							<p className="text-body-secondary small mb-2">
								{application.pronouns}
								{application.pronouns ? ' · ' : ''}
								{application.email}
							</p>
							<div className="d-flex flex-wrap gap-1">
								<StatusBadge status={application.status} />
								<SourceBadge source={application.source} />
							</div>
						</div>
						<button
							type="button"
							className="btn-close"
							aria-label="Close"
							onClick={onClose}
						/>
					</div>

					<div className="flex-grow-1 overflow-auto p-3">
						<Answer
							heading="h3"
							spacing="mb-3"
							label="How did you hear about us?"
							value={application.howDidYouHear}
						/>
						<Answer
							heading="h3"
							spacing="mb-3"
							label="Coding journey"
							value={application.journey}
						/>
						<Answer
							heading="h3"
							spacing="mb-3"
							label="Coding interests"
							value={application.codeInterests}
						/>
						<Answer
							heading="h3"
							spacing="mb-3"
							label="Hoping to get"
							value={application.virtualCoffee}
						/>
						<dl className="row small text-body-secondary mb-0">
							<dt className="col-5">Submitted</dt>
							<dd className="col-7">{formatDate(application.submittedAt)}</dd>
							{application.referrer && (
								<>
									<dt className="col-5">Referrer</dt>
									<dd className="col-7">{application.referrer}</dd>
								</>
							)}
							<dt className="col-5">Code of Conduct</dt>
							<dd className="col-7">
								{application.agreedToCocAt
									? `agreed ${formatDate(application.agreedToCocAt)}`
									: 'not recorded'}
							</dd>
						</dl>
					</div>

					<div className="border-top p-3 d-flex flex-wrap gap-2">
						<Link
							className="btn btn-primary"
							href={`/admin/waitlist/${application.id}`}
						>
							Open full application
						</Link>
						<button
							type="button"
							className="btn btn-outline-secondary"
							onClick={onClose}
						>
							Close
						</button>
					</div>
				</div>
			)}
		</dialog>
	);
}
