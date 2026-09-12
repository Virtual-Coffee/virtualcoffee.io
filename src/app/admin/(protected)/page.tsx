import Link from 'next/link';

import { requireSession, visibleSections } from '@/lib/adminAccess';
import { dashboardCards, recentActivity } from '@/lib/dashboard';
import { ActivityFeed } from './activityFeed';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Admin',
	robots: { index: false, follow: false },
};

/**
 * The landing screen for /admin.
 *
 * Everything here is scoped to the sections the viewer holds a permission on,
 * so a volunteer with one narrow role sees one card and the activity for it —
 * the same page, not a different one.
 */
export default async function AdminDashboardPage() {
	const session = await requireSession();
	const sections = visibleSections(session);

	const [cards, activity] = await Promise.all([
		dashboardCards(sections),
		recentActivity(sections),
	]);

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<h1 className="h4 mb-4">
				Welcome back, {session.user.name || session.user.email}
			</h1>

			{cards.length > 0 && (
				<div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-4">
					{cards.map((card) => (
						<div className="col" key={card.section}>
							<Link
								href={card.href}
								className="card h-100 text-decoration-none text-body"
							>
								<div className="card-body">
									<h2 className="h6 card-title text-body-secondary">
										{card.label}
									</h2>
									<div className="d-flex flex-wrap gap-4">
										{card.figures.map((figure) => (
											<div key={figure.label}>
												<p className="display-6 mb-0">
													{figure.count.toLocaleString()}
												</p>
												<p className="small text-body-secondary mb-0">
													{figure.label}
												</p>
											</div>
										))}
									</div>
								</div>
							</Link>
						</div>
					))}
				</div>
			)}

			<h2 className="h5">Recent activity</h2>
			<ActivityFeed entries={activity} />
		</div>
	);
}
