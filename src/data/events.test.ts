import { describe, expect, test } from 'vitest';
import type { calendar_v3 } from '@googleapis/calendar';
import { fakeCalendarClient } from '@/test/calendar';

import {
	isDisplayableEvent,
	listDisplayableEvents,
	renderDescription,
} from './events';

/**
 * Covers the pure half of the Google Calendar fetch. `getEvents` itself is
 * left to the deploy preview: it is wrapped in `unstable_cache` and needs real
 * credentials.
 */

const timed: calendar_v3.Schema$Event = {
	id: 'abc',
	summary: 'Coffee',
	start: { dateTime: '2026-09-15T09:00:00-04:00' },
	end: { dateTime: '2026-09-15T10:00:00-04:00' },
};

/** A client serving `pages` in order; `listed()` is the params it was asked with. */
function stubClient(pages: calendar_v3.Schema$Events[]) {
	const { client, calls } = fakeCalendarClient({ list: pages });
	const listed = () =>
		calls.flatMap((call) => (call.method === 'list' ? [call.params] : []));
	return { client, listed };
}

describe('renderDescription', () => {
	test('keeps HTML as HTML, through the allowlist', async () => {
		await expect(
			renderDescription('<p>line one</p><script>x()</script>'),
		).resolves.toBe('<p>line one</p>');
	});

	test('renders Markdown', async () => {
		await expect(
			renderDescription('Come **hang out**\n\n- coffee\n- code'),
		).resolves.toBe(
			'<p>Come <strong>hang out</strong></p>\n<ul>\n<li>coffee</li>\n<li>code</li>\n</ul>',
		);
	});

	test("Google's entity encoding is decoded once, not escaped again", async () => {
		await expect(
			renderDescription('it&#39;s Tuesday &amp; sunny'),
		).resolves.toBe("<p>it's Tuesday &amp; sunny</p>");
	});

	test('a plain two-line description is two paragraphs', async () => {
		await expect(renderDescription('one\n\ntwo')).resolves.toBe(
			'<p>one</p>\n<p>two</p>',
		);
	});
});

describe('isDisplayableEvent', () => {
	test('accepts a timed, titled event', () => {
		expect(isDisplayableEvent(timed)).toBe(true);
	});

	test('rejects cancelled entries and entries without an id', () => {
		expect(isDisplayableEvent({ ...timed, status: 'cancelled' })).toBe(false);
		expect(isDisplayableEvent({ ...timed, id: undefined })).toBe(false);
	});

	test('rejects all-day events, which only carry a date', () => {
		expect(
			isDisplayableEvent({
				...timed,
				start: { date: '2026-09-15' },
				end: { date: '2026-09-16' },
			}),
		).toBe(false);
	});

	test('rejects untitled events, which would render as an empty heading', () => {
		expect(isDisplayableEvent({ ...timed, summary: undefined })).toBe(false);
		expect(isDisplayableEvent({ ...timed, summary: '' })).toBe(false);
		expect(isDisplayableEvent({ ...timed, summary: '   ' })).toBe(false);
	});
});

describe('listDisplayableEvents', () => {
	const window = {
		calendarId: 'cal@example.com',
		timeMin: '2026-09-12T04:00:00.000Z',
		timeMax: '2026-10-12T04:00:00.000Z',
	};

	test('asks for expanded instances in start order, without a page size tied to the limit', async () => {
		const { client, listed } = stubClient([{ items: [timed] }]);
		await listDisplayableEvents(client, { ...window, limit: 5 });

		expect(listed()).toEqual([
			{
				...window,
				singleEvents: true,
				orderBy: 'startTime',
				timeZone: 'America/New_York',
				pageToken: undefined,
			},
		]);
	});

	test('follows nextPageToken until the limit is met', async () => {
		const { client, listed } = stubClient([
			{ items: [{ ...timed, id: '1' }], nextPageToken: 'p2' },
			{ items: [{ ...timed, id: '2' }], nextPageToken: 'p3' },
			{ items: [{ ...timed, id: '3' }] },
		]);
		const events = await listDisplayableEvents(client, { ...window, limit: 2 });

		expect(events.map((e) => e.id)).toEqual(['1', '2']);
		expect(listed().map((c) => c.pageToken)).toEqual([undefined, 'p2']);
	});

	test('stops at the last page when the window has fewer events than the limit', async () => {
		const { client, listed } = stubClient([
			{ items: [{ ...timed, id: '1' }], nextPageToken: 'p2' },
			{ items: [{ ...timed, id: '2' }] },
		]);
		const events = await listDisplayableEvents(client, {
			...window,
			limit: 20,
		});

		expect(events.map((e) => e.id)).toEqual(['1', '2']);
		expect(listed()).toHaveLength(2);
	});

	test('filtered-out entries do not use up the limit', async () => {
		const { client } = stubClient([
			{
				items: [
					{ ...timed, id: 'all-day', start: { date: '2026-09-15' } },
					{ ...timed, id: 'untitled', summary: '' },
					{ ...timed, id: '1' },
				],
				nextPageToken: 'p2',
			},
			{
				items: [
					{ ...timed, id: '2' },
					{ ...timed, id: '3' },
				],
			},
		]);
		const events = await listDisplayableEvents(client, { ...window, limit: 2 });

		expect(events.map((e) => e.id)).toEqual(['1', '2']);
	});

	test('a page with no items is not the end of the results', async () => {
		const { client } = stubClient([
			{ nextPageToken: 'p2' },
			{ items: [{ ...timed, id: '1' }] },
		]);
		const events = await listDisplayableEvents(client, { ...window, limit: 5 });

		expect(events.map((e) => e.id)).toEqual(['1']);
	});
});
