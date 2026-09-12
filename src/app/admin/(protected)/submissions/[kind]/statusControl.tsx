'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { SubmissionStatus } from '@/db';
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
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

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
						onClick={() =>
							startTransition(async () => {
								const result = await setSubmissionStatus(kind, id, value);
								if (result.ok) {
									setError(null);
									router.refresh();
								} else {
									setError(result.message);
								}
							})
						}
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
