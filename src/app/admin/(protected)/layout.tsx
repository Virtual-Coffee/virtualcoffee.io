import type { ReactNode } from 'react';
import Link from 'next/link';

import { SignOutButton } from '@/app/admin/sign-in/buttons';
import { requireAdmin } from '@/lib/adminAccess';
import { AdminNav } from './adminNav';

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
	// The authorization boundary. Server actions re-check independently rather
	// than trusting that they were reached from inside this layout.
	const session = await requireAdmin();

	return (
		<div className="admin-shell d-flex flex-column min-vh-100">
			<header className="border-bottom bg-body-tertiary">
				<div className="container-fluid px-3 px-lg-4">
					<div className="d-flex flex-wrap align-items-center gap-3 py-2">
						<Link
							href="/admin"
							className="fw-semibold text-body text-decoration-none"
						>
							Admin
						</Link>
						<AdminNav />
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
		</div>
	);
}
