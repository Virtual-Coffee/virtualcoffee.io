import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';

export function createEventsData({ limit = 15, rangeStart, rangeEnd }) {
	const dates = faker.date.betweens(rangeStart, rangeEnd, limit);

	return dates.map((date) => {
		console.log(typeof date);
		const startDate = DateTime.fromJSDate(date);

		return {
			id: faker.datatype.uuid(),
			title: faker.lorem.sentence(7),
			startDateLocalized: startDate.toString(),
			endDateLocalized: startDate.plus({ hours: 1 }),
			eventCalendarDescription: `<p>${faker.lorem.paragraph()}</p>`,
		};
	});
}
