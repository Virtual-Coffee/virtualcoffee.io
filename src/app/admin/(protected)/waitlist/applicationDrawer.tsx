'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

import type { MembershipApplication } from '@/db';
import { SourceBadge, StatusBadge, formatDate } from '../presentation';

/**
 * A native <dialog>, so Escape-to-close, focus trapping and making the page
 * behind it inert all come from the platform. Bootstrap's offcanvas would need
 * Bootstrap's JavaScript, which this project doesn't load.
 */
export function ApplicationDrawer({
	application,
	onClose,
}: {
	application: MembershipApplication | null;
	onClose: () => void;
}) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;

		if (application && !dialog.open) {
			dialog.showModal();
		} else if (!application && dialog.open) {
			dialog.close();
		}
	}, [application]);

	return (
		<dialog ref={ref} className="admin-drawer" onClose={onClose}>
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
							label="How did you hear about us?"
							value={application.howDidYouHear}
						/>
						<Answer label="Coding journey" value={application.journey} />
						<Answer
							label="Coding interests"
							value={application.codeInterests}
						/>
						<Answer label="Hoping to get" value={application.virtualCoffee} />
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

function Answer({ label, value }: { label: string; value: string | null }) {
	return (
		<section className="mb-3">
			<h3 className="h6 text-body-secondary">{label}</h3>
			{value ? (
				<p className="admin-answer mb-0">{value}</p>
			) : (
				<p className="text-body-secondary fst-italic mb-0">No answer given</p>
			)}
		</section>
	);
}
