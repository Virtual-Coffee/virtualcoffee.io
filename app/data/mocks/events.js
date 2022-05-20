import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';
import { ics } from 'calendar-link';

export function createEventsData({ limit = 15, rangeStart, rangeEnd }) {
	const dates = faker.date.betweens(rangeStart, rangeEnd, limit);

	return dates.map((date) => {
		const startDate = DateTime.fromJSDate(date);
		const calendarLink = ics({
			title: faker.lorem.sentence(7),
			start: startDate.toString(),
			end: startDate.plus({ hours: 1 }),
		});

		return {
			id: faker.datatype.uuid(),
			title: faker.lorem.sentence(7),
			startDateLocalized: startDate.toString(),
			endDateLocalized: startDate.plus({ hours: 1 }),
			eventCalendarDescription: `<p>${faker.lorem.paragraph()}</p>`,
			eventCalendarLink: calendarLink,
		};
	});
}
