'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Inter } from 'next/font/google';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import '@/styles/main.scss';

// Replaces the root layout when the layout itself throws, so it owns its
// own <html>/<body>, stylesheet and font. No Nav: it may be what crashed.
const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-inter',
});

export default function GlobalError({
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
		<html lang="en" className={`h-full bg-gray-100 ${inter.variable}`}>
			<body className="h-full">
				<title>Something went wrong - Virtual Coffee IO</title>
				<DefaultLayout
					Hero="UndrawFixingBugs"
					heroHeader="Something went wrong"
					heroSubheader="The page hit an error it couldn't recover from."
					simple
				>
					<p className="lead">
						We've been notified. You can try the page again, or head back to the
						home page.
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
						    soft navigation to the same pathname leaves the boundary active,
						    and the router may be what crashed; reload the document instead */}
						<a href="/" className="btn btn-outline-secondary">
							Go to the home page
						</a>
					</p>
				</DefaultLayout>
			</body>
		</html>
	);
}
