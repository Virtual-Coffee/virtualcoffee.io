import { DateTime } from 'luxon';
/**
 * @description Formats and returns a date for humans. If it's server run, return in UTC. If it's browser run, return local time.
 * @param {(string|Date)} dateString Date to convert (String or Date obj)
 * @param {string} [format='fff'] {@link https://moment.github.io/luxon/#/formatting?id=table-of-tokens|Luxon format token}
 * @param {object} [opts={}] {@link https://moment.github.io/luxon/api-docs/index.html#datetime|DateTime override options}
 * @return {string}
 */
export function dateForDisplay(dateString, format = 'fff', opts = {}) {
	const resolvedOptions = {
		...opts,
	};
	let d = dateString;
	if (typeof d === 'object' && d.toISOString) {
		d = d.toISOString();
	}

	if (typeof window === 'undefined') {
		return DateTime.fromISO(d).toUTC().toFormat(format, resolvedOptions);
	}
	return DateTime.fromISO(d).toLocal().toFormat(format, resolvedOptions);
}
