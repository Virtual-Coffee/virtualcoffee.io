/**
 * The kinds of thing on the Events Calendar, as `extendedProperties.private
 * .eventType`. Keys are stable — the planned calendar feed filters on them —
 * so a new kind is appended, never renamed. ADR 0014.
 *
 * Its own module because the admin forms (client components) need the list
 * and `eventsCalendar.ts` pulls the Google client in; import from there on
 * the server, from here in the browser.
 */
export const EVENT_TYPES = [
	'virtual-coffee',
	'lunch-and-learn',
	'coffee-table-group',
	'monthly-challenge',
	'community-event',
	'other',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
	'virtual-coffee': 'Virtual Coffee',
	'lunch-and-learn': 'Lunch & Learn',
	'coffee-table-group': 'Coffee Table Group',
	'monthly-challenge': 'Monthly Challenge',
	'community-event': 'Community Event',
	other: 'Other',
};

export function isEventType(value: unknown): value is EventType {
	return (EVENT_TYPES as readonly unknown[]).includes(value);
}
