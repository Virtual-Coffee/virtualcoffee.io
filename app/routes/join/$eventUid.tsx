import { json, redirect } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/auth/auth.server';
import { CmsActions } from '~/api/cms.server';
import { DateTime } from 'luxon';
import DefaultLayout from '~/components/layouts/DefaultLayout';

type CalendarVisibility = 'membersOnly' | 'pendingMembers' | 'public';
type EventVisibility = CalendarVisibility | 'default';

type Event = {
	id: string;
	uid: string;
	title: string;
	rrule?: string;
	calendarId: string | number;
	startDateLocalized: string;
	endDateLocalized: string;
	eventVisibility?: EventVisibility;
	eventJoinLink?: string;
	eventLink?: string;
	eventCalendarDescription?: string;
};

type SafeEvent = Omit<Event, 'eventJoinLink' | 'eventLink'>;

type Calendar = {
	id: number;
	title: string;
	calendarVisibility: CalendarVisibility;
};

type User = {
	jwt: string;
	jwtExpiresAt: number;
	refreshToken: string;
	refreshTokenExpiresAt: number;
	schema: 'Pending Members Schema' | 'Full Members Schema';
	user: {
		id: string | number;
		email: string;
		enabled: boolean;
		status: string;
		userYourName?: string;
	};
};

type EventLoaderData = {
	message: string;
	event?: SafeEvent;
	type: 'error' | 'timing' | 'permissions' | 'noLink';
};

export const loader: LoaderFunction = async ({ request, params }) => {
	let api = new CmsActions();
	let returnJson: EventLoaderData | null = null;

	try {
		const event: Event = await api.getEventByUid({ uid: params.eventUid });

		if (!event) {
			returnJson = {
				type: 'error',
				message: 'Event not found. Please check your event link and try again.',
			};
			return json(returnJson);
		}

		const safeEvent = {
			id: event.id,
			uid: event.uid,
			title: event.title,
			rrule: event.rrule,
			calendarId: event.calendarId,
			startDateLocalized: event.startDateLocalized,
			endDateLocalized: event.endDateLocalized,
			eventVisibility: event.eventVisibility,
			eventCalendarDescription: event.eventCalendarDescription,
		};

		// check timing
		const now = DateTime.now();
		const startTime = DateTime.fromISO(event.startDateLocalized).setZone(
			'America/New_York',
		);
		const endTime = DateTime.fromISO(event.endDateLocalized).setZone(
			'America/New_York',
		);

		if (now < startTime.minus({ minutes: 10 })) {
			returnJson = {
				type: 'timing',
				message: `The event hasn't started yet!`,
				event: safeEvent,
			};
			return json(returnJson);
		}

		if (now > endTime.plus({ hours: 2 })) {
			returnJson = {
				type: 'timing',
				message: `This event has already ended.`,
				event: safeEvent,
			};
			return json(returnJson);
		}

		// check visibility

		let visibility = event.eventVisibility;

		if (!visibility || visibility === 'default') {
			// we need to get the parent calendar and check it's visibility
			const calendar: Calendar = await api.getCalendarEntryByCalendarId({
				id: event.calendarId,
			});

			if (!calendar) {
				return json({
					message:
						'Calendar not found. Please check your event link and try again.',
				});
			}

			visibility = calendar.calendarVisibility;
		}

		if (visibility === 'public') {
			if (event.eventJoinLink) {
				return redirect(event.eventJoinLink);
			}

			returnJson = {
				type: 'noLink',
				message: `This event has no link.`,
				event: safeEvent,
			};
			return json(returnJson);
		}

		// if it's not public, then authenticate

		let user: User = await authenticate(request);
		console.log(user.user);

		if (user) {
			if (
				visibility === 'membersOnly' &&
				user.schema !== 'Full Members Schema'
			) {
				returnJson = {
					type: 'permissions',
					message: `This event is for members only.`,
					event: safeEvent,
				};
				return json(returnJson);
			}

			if (event.eventJoinLink) {
				return redirect(event.eventJoinLink);
			}

			returnJson = {
				type: 'noLink',
				message: `This event has no link.`,
				event: safeEvent,
			};
			return json(returnJson);
		}

		throw new Error('Something went wrong');
	} catch (error) {
		if (error instanceof Response) {
			return error;
		}

		console.log(error);
		returnJson = {
			type: 'error',
			message:
				'There was an error loading the event. Please check your event link and try again.',
		};
		return json(returnJson);
	}
};

export default function Screen() {
	const loaderData: EventLoaderData = useLoaderData();
	console.log({ loaderData });
	return (
		<DefaultLayout simple showHero={false}>
			<div>{loaderData.message}</div>
		</DefaultLayout>
	);
}
