import { LoaderArgs } from '@remix-run/server-runtime';
import { CmsActions } from '~/api/cms.server';
import { redirect } from '@remix-run/node';

export async function loader({ params }: LoaderArgs) {
	let api = new CmsActions();

	if (!params.calendarHandle) {
		throw new Error('Calendar handle is required');
	}

	const calendar = await api.getCalendar(params.calendarHandle);

	return redirect(
		`${process.env.CMS_URL}/index.php?p=actions/calendar/api/ics&hash=${calendar.icsHash}`,
	);
}
