import { json } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { authenticate } from '~/auth/auth.server';
import { CmsActions } from '~/api/cms.server';

export async function loader({ request, params }) {
	let user = await authenticate(request);
	let api = new CmsActions();

	try {
		const event = await api.getEventByUid({ request, uid: params.eventUid });

		if (!event) {
			return json({
				message: 'Event not found. Please check your event link and try again.',
			});
		}

		// default
		// membersOnly
		// pendingMembers
		// public

		// step one -
		// 	grab event by UID + range - time + 1 day
		// step two -
		// 	check permissions
		// step three -
		// 	check timing of event. are we within start - 10 minutes and end + 15 minutes

		return null;
	} catch (error) {}
}

export default function Screen() {
	return <div>yo</div>;
}
