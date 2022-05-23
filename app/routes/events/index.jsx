import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import DisplayHtml from '~/components/DisplayHtml';
import { getEvents } from '~/data/events';
import { dateForDisplay } from '~/util/date';
import { createMetaData } from '~/util/createMetaData.server';

export async function loader() {
	const events = await getEvents({
		limit: 20,
	});

	const meta = createMetaData({
		title: 'Virtual Coffee Community Events',
		description: 'See our upcoming events!',
		Hero: 'UndrawConferenceCall',
	});

	return json({ events, meta });
}

export function meta({ data: { meta } = {} } = {}) {
	return meta;
}

export default function EventsIndex() {
	const { events } = useLoaderData();
	return (
		<DefaultLayout
			Hero="UndrawConferenceCall"
			heroHeader="Virtual Coffee Events"
			heroSubheader="Please join us at one of our events!"
		>
			<div className="bg-light py-5">
				<div className="container-xl">
					<h2>Upcoming Events</h2>
					<div className="mb-3">
						<p>
							<strong>
								As we move into our third year, we’ve paused new members joining
								our coffee chats as we support our current community and make
								plans for the future. We hope to see you all soon &#x1f496;
							</strong>
						</p>
					</div>

					{events.map((event) => (
						<div className="card mb-4" key={event.startDateLocalized}>
							<div className="card-header py-2 d-flex justify-content-between align-items-center flex-row flex-wrap">
								<time dateTime={event.startDateLocalized}>
									{dateForDisplay(event.startDateLocalized, 'EEEE, fff')}
								</time>

								<a href={event.eventCalendarLink} download>
									<small> Add to Calendar</small>
								</a>
							</div>
							<div className="card-body">
								<h5 className="card-title">{event.title}</h5>
								{event.eventCalendarDescription && (
									<DisplayHtml
										html={event.eventCalendarDescription}
										className="card-text"
									/>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</DefaultLayout>
	);
}
