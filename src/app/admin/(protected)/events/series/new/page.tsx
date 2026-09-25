import { requirePermission } from '@/lib/access/adminAccess';

import { Breadcrumb } from '../../../presentation';
import { SeriesForm } from '../../seriesForm';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'New Series · Admin',
	robots: { index: false, follow: false },
};

export default async function NewSeriesPage() {
	await requirePermission('events', 'manage');
	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<Breadcrumb
				parent={{ href: '/admin/events', label: 'Events' }}
				current="New Series"
			/>
			<h1 className="h4 mb-3">New Series</h1>
			<div className="col-lg-7">
				<SeriesForm />
			</div>
		</div>
	);
}
