import { describe, expect, test } from 'vitest';

import {
	neverAnnouncedAmong,
	neverAnnouncedCount,
	recordEvent,
} from '@/lib/history/eventLog';
import { insertApplication } from '@/test/db/fixtures';

import {
	applicationSubject,
	listApplications,
	type ListFilters,
} from './applications';
import { ARCHIVE_STATUSES, QUEUE_STATUSES } from './applicationStatuses';

const byName: ListFilters = {
	page: 0,
	pageSize: 50,
	sort: 'name',
	direction: 'asc',
};

async function names(filters: ListFilters) {
	const { rows } = await listApplications(filters);
	return rows.map((row) => row.name);
}

describe('listApplications ordering', () => {
	test('the queue puts invited applications first, whatever the sort', async () => {
		await insertApplication({ name: 'Ada' });
		await insertApplication({ name: 'Zed', isPriority: true });
		await insertApplication({ name: 'Mia' });

		await expect(
			names({ ...byName, statuses: QUEUE_STATUSES, priorityFirst: true }),
		).resolves.toEqual(['Zed', 'Ada', 'Mia']);
	});

	test('the archive is sorted by the column alone', async () => {
		await insertApplication({ name: 'Ada', status: 'declined' });
		await insertApplication({
			name: 'Zed',
			status: 'member',
			isPriority: true,
		});
		await insertApplication({ name: 'Mia', status: 'withdrawn' });

		await expect(
			names({ ...byName, statuses: ARCHIVE_STATUSES }),
		).resolves.toEqual(['Ada', 'Mia', 'Zed']);
	});
});

describe('listApplications search', () => {
	test.each([
		['dev_user', ['dev_user']],
		['%', []],
		['\\', ['back\\slash']],
	])('%j is matched literally, not as a pattern', async (search, expected) => {
		await insertApplication({
			name: 'dev_user',
			email: 'dev_user@example.test',
		});
		await insertApplication({
			name: 'devXuser',
			email: 'devxuser@example.test',
		});
		await insertApplication({
			name: 'back\\slash',
			email: 'back@example.test',
		});

		await expect(names({ ...byName, search })).resolves.toEqual(expected);
	});
});

describe('unannounced applications', () => {
	// The rule itself is tabled in eventLog.db.test.ts; this is the queue's use.
	test('the queue marks the applications the banner counts', async () => {
		const before = await neverAnnouncedCount({ kind: 'application' });
		const { id: bare } = await insertApplication({ status: 'waitlisted' });
		const { id: sent } = await insertApplication({ status: 'waitlisted' });
		await recordEvent(applicationSubject(sent), { type: 'notification_sent' });
		const { id: moved } = await insertApplication({ status: 'coffee_invited' });

		await expect(
			neverAnnouncedAmong({ kind: 'application' }, [bare, sent, moved]),
		).resolves.toEqual([bare]);
		await expect(neverAnnouncedCount({ kind: 'application' })).resolves.toBe(
			before + 1,
		);
	});
});
