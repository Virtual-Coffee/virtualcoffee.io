import { json } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { authenticate } from '~/auth/auth.server';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { CmsActions } from '~/api/cms.server';
import type { LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { DateDetails } from '~/components/app/Events';
import type { EventsWithCheck } from '~/components/app/Events';
import { Button } from '~/components/app/Button';

export const loader = async ({ request }: LoaderArgs) => {
	await authenticate(request);

	let api = new CmsActions();
	await api.authenticate(request);

	// const calendars = await api.getCalendars();

	const month = new Date().getMonth() + 1;

	const day = new Date().getDate();

	const weekStart = DateTime.now().set({
		month,
		day,
		hour: 0,
		minute: 0,
		second: 0,
	});
	const weekEnd = weekStart.plus({ days: 6 }).set({
		hour: 23,
		minute: 59,
		second: 59,
	});

	// load events for that range
	const events = await api.getEventsInRange({
		rangeStart: weekStart.toISO(),
		rangeEnd: weekEnd.toISO(),
		// calendars: calendars.map((c) => c.handle),
	});

	// return json({
	// 	meta: {
	// 		title: 'Events',
	// 	},
	// });

	const eventsWithCheck: EventsWithCheck[] = await Promise.all(
		events.map(async (event) => {
			if (
				DateTime.fromISO(event.startDateLocalized).hasSame(
					DateTime.now(),
					'day',
				)
			) {
				const jl = await api.getEventJoinLink(event, request);
				return { ...event, isCurrent: jl.type === 'success' };
			}

			return { ...event, isCurrent: false };
		}),
	);

	return json({
		meta: {
			title: 'Dashboard',
		},
		events: eventsWithCheck,
		settings: {
			month,
			day,
			weekStart,
			weekEnd,
		},
	});
};

export default function Page() {
	const { events, settings } = useLoaderData<typeof loader>();

	return (
		<section className="mt-12">
			<h2 className="font-semibold text-gray-900">Upcoming events</h2>

			<ol className="mt-2 divide-y divide-gray-200 text-sm leading-6 text-gray-500">
				{events.map((event) => {
					const eventStartDate = DateTime.fromISO(event.startDateLocalized);
					const eventEndDate = DateTime.fromISO(event.endDateLocalized);
					return (
						<li
							className={classNames(
								'py-4',
								event.isCurrent &&
									'bg-white px-3 -mx-3 rounded-sm outline outline-sky-500 my-4',
							)}
							key={`${event.id}${event.startDateLocalized}`}
						>
							<div className="sm:flex">
								<time
									dateTime={event.startDateLocalized}
									className="w-28 flex-none"
								>
									{eventStartDate.toLocaleString(DateTime.DATE_MED)}
								</time>
								<p className="mt-2 flex-auto font-semibold text-gray-900 sm:mt-0">
									{event.title}
								</p>
								<p className="flex-none sm:ml-6">
									<time
										dateTime={event.startDateLocalized}
										className="w-28 flex-none"
									>
										{eventStartDate.toLocaleString({
											...DateTime.TIME_SIMPLE,

											timeZoneName: 'short',
										})}
									</time>{' '}
									-{' '}
									<time
										dateTime={event.endDateLocalized}
										className="w-28 flex-none"
									>
										{eventEndDate.toLocaleString({
											...DateTime.TIME_SIMPLE,

											timeZoneName: 'short',
										})}
									</time>
								</p>
							</div>

							{event.isCurrent && (
								<div className="mt-4 text-right">
									<Button
										as="a"
										href={event.eventLink}
										target="_blank"
										rel="nofollow"
									>
										Join Now
									</Button>
								</div>
							)}
						</li>
					);
				})}

				{/* <DateDetails
							as="li"
							event={event}
							showDescription={false}
							key={`${event.id}${event.startDateLocalized}`}
							className={
								event.isCurrent
									? 'bg-white px-3 -mx-3 rounded outline outline-blue-500 my-6'
									: 'my-3'
							}
						/>
				 */}
			</ol>

			<div className="mt-4 text-right">
				<Link className="text-sky-700 underline" to="/membership/events">
					See details and more events
				</Link>
			</div>
		</section>
	);
}
