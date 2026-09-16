import { requirePermission } from '@/lib/adminAccess';

import { Breadcrumb } from '../../presentation';
import { EventForm } from '../eventForm';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'New Event · Admin',
	robots: { index: false, follow: false },
};

export default async function NewEventPage() {
	await requirePermission('events', 'manage');
	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<Breadcrumb
				parent={{ href: '/admin/events', label: 'Events' }}
				current="New Event"
			/>
			<h1 className="h4 mb-3">New Event</h1>
			<p className="text-body-secondary">
				A single Event that is not part of a Series.
			</p>
			<div className="col-lg-7">
				<EventForm />
			</div>
		</div>
	);
}
