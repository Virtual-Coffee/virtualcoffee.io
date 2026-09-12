import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';
import { ics, google, outlook } from 'calendar-link';
import type { EventsResponse } from '../events';

/**
 * Stand-in for `getEvents` when Google Calendar is not configured: `limit`
 * fake one-hour events scattered across the same range the real query uses,
 * shaped like `EventsResponse` down to the calendar links.
 */
export function createEventsData({
	limit = 15,
	rangeStart,
	rangeEnd,
}: {
	limit: number;
	rangeStart: string;
	rangeEnd: string;
}): EventsResponse {
	const dates = faker.date.betweens({
		from: rangeStart,
		to: rangeEnd,
		count: limit,
	});

	return dates.map((date) => {
		const startDate = DateTime.fromJSDate(date);
		const title = faker.lorem.sentence(7);
		const paragraph = faker.lorem.paragraph();
		const start = startDate.toUTC().toString();
		const end = startDate.toUTC().plus({ hours: 1 }).toString();
		const linkDetails = { title, start, end, description: paragraph };

		return {
			id: faker.string.uuid(),
			title,
			start,
			end,
			description: `<p>${paragraph}</p>`,
			calendarLinks: {
				google: google(linkDetails),
				outlook: outlook(linkDetails),
				ics: ics(linkDetails),
			},
		};
	});
}
