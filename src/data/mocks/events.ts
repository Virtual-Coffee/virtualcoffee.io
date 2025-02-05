import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';
import { ics, google, outlook } from 'calendar-link';

export function createEventsData({
	limit = 15,
	rangeStart,
	rangeEnd,
}: {
	limit: number;
	rangeStart: string;
	rangeEnd: string;
}) {
	const dates = faker.date.betweens({
		from: rangeStart,
		to: rangeEnd,
		count: limit,
	});

	return dates.map((date) => {
		const startDate = DateTime.fromJSDate(date);
		const calendarLinkGoogle = google({
			title: faker.lorem.sentence(7),
			start: startDate.toUTC().toString(),
			end: startDate.toUTC().plus({ hours: 1 }).toString(),
			description: faker.lorem.paragraph(),
		  });
		  const calendarLinkOutlook = outlook({
			title: faker.lorem.sentence(7),
			start: startDate.toUTC().toString(),
			end: startDate.toUTC().plus({ hours: 1 }).toString(),
			description: faker.lorem.paragraph(),
		  });
		  const calendarLinkIcs = ics({
			title: faker.lorem.sentence(7),
			start: startDate.toUTC().toString(),
			end: startDate.toUTC().plus({ hours: 1 }).toString(),
			description: faker.lorem.paragraph(),
		  });

		return {
			id: faker.string.uuid(),
			title: faker.lorem.sentence(7),
			startDateLocalized: startDate.toUTC().toString(),
			endDateLocalized: startDate.toUTC().plus({ hours: 1 }).toString(),
			eventCalendarDescription: `<p>${faker.lorem.paragraph()}</p>`,
			eventCalendarLinks: {
				google: calendarLinkGoogle,
				outlook: calendarLinkOutlook,
				ics: calendarLinkIcs,
			},
		};
	});
}
