import type { calendar_v3 } from '@googleapis/calendar';

import type { CalendarClient } from '@/lib/eventsCalendar';

type Events = CalendarClient['events'];

/** One recorded call, typed by the method it went to. */
export type CalendarCall = {
	[M in keyof Events]: {
		method: M;
		params: Parameters<Events[M]>[0];
		options?: Parameters<Events[M]>[1];
	};
}[keyof Events];

/**
 * A Calendar client that answers from canned data and records every call it
 * gets — for `eventsCalendar()` and, by the `list` half alone, for the public
 * `listDisplayableEvents`.
 */
export function fakeCalendarClient(canned: {
	list?: calendar_v3.Schema$Events[];
	get?: Record<string, calendar_v3.Schema$Event>;
	/** One page, or the pages in order for a call that follows `nextPageToken`. */
	instances?: Record<
		string,
		calendar_v3.Schema$Events | calendar_v3.Schema$Events[]
	>;
	patchError?: unknown;
}) {
	const calls: CalendarCall[] = [];
	let page = 0;
	const instancePages = new Map<string, number>();
	const client: CalendarClient = {
		events: {
			async list(params) {
				calls.push({ method: 'list', params });
				return { data: canned.list?.[page++] ?? {} };
			},
			async get(params) {
				calls.push({ method: 'get', params });
				const data = canned.get?.[params.eventId ?? ''];
				if (!data) throw Object.assign(new Error('not found'), { status: 404 });
				return { data };
			},
			async instances(params) {
				calls.push({ method: 'instances', params });
				const id = params.eventId ?? '';
				const canned_ = canned.instances?.[id] ?? { items: [] };
				if (!Array.isArray(canned_)) return { data: canned_ };
				const index = instancePages.get(id) ?? 0;
				instancePages.set(id, index + 1);
				return { data: canned_[index] ?? { items: [] } };
			},
			async insert(params) {
				calls.push({ method: 'insert', params });
				return { data: { id: 'new-id' } };
			},
			async patch(params, options) {
				calls.push({ method: 'patch', params, options });
				if (canned.patchError) throw canned.patchError;
				return { data: params.requestBody ?? {} };
			},
			async delete(params, options) {
				calls.push({ method: 'delete', params, options });
				return {};
			},
		},
	};
	return { client, calls };
}
