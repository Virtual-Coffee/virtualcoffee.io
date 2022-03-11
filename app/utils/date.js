import { DateTime } from 'luxon';

export function dateForDisplay(dateString, format = 'fff', opts = {}) {
	const resolvedOptions = {
		...opts,
	};
	let d = dateString;
	if (typeof d === 'object' && d.toISOString) {
		d = d.toISOString();
	}
	return DateTime.fromISO(d)
		.setZone('America/New_York')
		.toFormat(format, resolvedOptions);
}
