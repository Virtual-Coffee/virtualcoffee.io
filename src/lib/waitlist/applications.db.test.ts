import { describe, expect, test } from 'vitest';

import { recordEvent } from '@/lib/history/eventLog';
import { insertApplication } from '@/test/db/fixtures';

import {
	applicationSubject,
	listApplications,
	unannouncedAmong,
	unannouncedCount,
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
	async function announced(
		fields: Parameters<typeof insertApplication>[0],
		...types: ('notification_sent' | 'notification_failed')[]
	) {
		const { id } = await insertApplication(fields);
		// Spaced out: History orders by `created_at`, then by id.
		for (const [i, type] of types.entries()) {
			await recordEvent(applicationSubject(id), {
				type,
				createdAt: new Date(Date.now() + i * 1000),
			});
		}
		return id;
	}

	test('only an application whose latest announcement failed is marked', async () => {
		const failed = await announced({ name: 'Failed' }, 'notification_failed');
		const retried = await announced(
			{ name: 'Retried' },
			'notification_failed',
			'notification_sent',
		);
		const sent = await announced({ name: 'Sent' }, 'notification_sent');
		// Imported: never announced by this site, so nothing to flag.
		const imported = await announced({ name: 'Imported' });

		await expect(
			unannouncedAmong([failed, retried, sent, imported]),
		).resolves.toEqual([failed]);
	});

	test('the count is of those still waiting on a first decision', async () => {
		await announced({ status: 'waitlisted' }, 'notification_failed');
		await announced({ status: 'coffee_invited' }, 'notification_failed');
		await announced({ status: 'waitlisted' }, 'notification_sent');

		await expect(unannouncedCount()).resolves.toBe(1);
	});
});
