'use client';

import type { SubmissionStatus } from '@/db';
import { useAction } from '@/util/forms/useAction';
import { setSubmissionStatus } from './actions';
import { STATUS_ORDER, submissionStatusLabel } from './presentation';
import { ReadOnlyNotice } from '../../presentation';

export function StatusControl({
	kind,
	id,
	status,
	canManage,
}: {
	kind: string;
	id: string;
	status: SubmissionStatus;
	canManage: boolean;
}) {
	const { run, pending, error } = useAction();

	if (!canManage) return <ReadOnlyNotice />;

	return (
		<div>
			<div className="btn-group" role="group" aria-label="Set status">
				{STATUS_ORDER.map((value) => (
					<button
						key={value}
						type="button"
						className={`btn btn-sm ${
							status === value ? 'btn-primary' : 'btn-outline-primary'
						}`}
						disabled={pending || status === value}
						aria-pressed={status === value}
						onClick={() => run(() => setSubmissionStatus(kind, id, value))}
					>
						{submissionStatusLabel(value)}
					</button>
				))}
			</div>
			{error && (
				<p className="small text-danger mt-2 mb-0" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
