'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { usePathname } from 'next/navigation';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { underPiiRoute } from '@/sentryDataCollection';

// Keeps the root layout (nav, footer); `global-error.tsx` is for when that
// layout itself throws.
export default function RootError({
	error,
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	const pathname = usePathname();

	useEffect(() => {
		// A thrown message can quote what a person typed; PII routes report
		// from the server only, with locals stripped (docs/adr/0015).
		if (underPiiRoute(pathname)) return;
		Sentry.captureException(error);
	}, [error, pathname]);

	return (
		<DefaultLayout
			Hero="UndrawFixingBugs"
			heroHeader="Something went wrong"
			heroSubheader="The page hit an error it couldn't recover from."
			simple
		>
			<p className="lead">
				You can try the page again, or head back to the home page.
			</p>
			<p>
				<button
					type="button"
					className="btn btn-primary me-3"
					onClick={() => retry()}
				>
					Try again
				</button>
				{/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a
				    soft navigation to the same pathname leaves the boundary active */}
				<a href="/" className="btn btn-outline-secondary">
					Go to the home page
				</a>
			</p>
		</DefaultLayout>
	);
}
