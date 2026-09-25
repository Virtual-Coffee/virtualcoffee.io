import type { ReactNode } from 'react';
import Link from 'next/link';

import { createDevtoolsPanelProps } from 'better-auth-devtools';

import { SignOutButton } from '@/app/admin/sign-in/buttons';
import { requireSession, visibleSections } from '@/lib/access/adminAccess';
import { devtoolsConfig } from '@/lib/access/devtools';
import { AdminNav } from './adminNav';
import { DeployBanner } from './deployBanner';
import { DevtoolsPanel } from './devtoolsPanel';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Admin',
	robots: { index: false, follow: false },
};

export default async function AdminLayout({
	children,
}: {
	children: ReactNode;
}) {
	// Holding some section gets you in; each Section page and action re-checks
	// its own Permission. The dashboard is the exception: it shows what the
	// viewer's sections allow rather than requiring one.
	const session = await requireSession();
	const sections = visibleSections(session);

	return (
		<div className="admin-shell d-flex flex-column min-vh-100">
			<header className="border-bottom bg-body-tertiary">
				<DeployBanner />
				<div className="container-fluid px-3 px-lg-4">
					<div className="d-flex flex-wrap align-items-center gap-3 py-2">
						<Link
							href="/admin"
							className="fw-semibold text-body text-decoration-none"
						>
							Admin
						</Link>
						<AdminNav sections={sections} />
						<div className="ms-auto d-flex align-items-center gap-2">
							<span className="text-body-secondary small">
								{session.user.name || session.user.email}
							</span>
							<SignOutButton />
						</div>
					</div>
				</div>
			</header>
			<main id="maincontent" className="flex-grow-1">
				{children}
			</main>
			<DevtoolsPanel {...createDevtoolsPanelProps(devtoolsConfig)} />
		</div>
	);
}
