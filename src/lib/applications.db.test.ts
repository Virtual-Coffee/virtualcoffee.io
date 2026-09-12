import { describe, expect, test } from 'vitest';

import { insertApplication } from '@/test/db/fixtures';

import {
	ARCHIVE_STATUSES,
	listApplications,
	QUEUE_STATUSES,
	type ListFilters,
} from './applications';

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
