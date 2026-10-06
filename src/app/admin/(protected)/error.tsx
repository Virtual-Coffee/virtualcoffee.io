'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

// Renders inside the admin shell, so the nav and sign-out stay.
export default function AdminError({
	error,
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<div className="alert alert-danger" role="alert">
				<h1 className="h5 alert-heading">Something went wrong</h1>
				<p className="mb-3">
					This page hit an error. The rest of the admin still works.
					{error.digest && (
						<>
							{' '}
							Reference: <code>{error.digest}</code>
						</>
					)}
				</p>
				<button
					type="button"
					className="btn btn-sm btn-danger"
					onClick={() => retry()}
				>
					Try again
				</button>
			</div>
		</div>
	);
}
