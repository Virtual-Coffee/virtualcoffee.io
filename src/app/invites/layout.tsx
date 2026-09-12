import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Your invites',
	robots: { index: false, follow: false },
};

/**
 * The shell for /invites. Not gated here: each page calls `requireVolunteer()`
 * itself, because the sign-in page beneath must stay reachable. Each page
 * renders its own `<main>` — the sign-in page's comes from `DefaultLayout`.
 */
export default function InvitesLayout({ children }: { children: ReactNode }) {
	return <div className="d-flex flex-column min-vh-100">{children}</div>;
}
