import { desc, eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';

import { membershipApplication } from '@/db';
import { insertApplication } from '@/test/db/fixtures';

import { countRows, pagedList } from './pagedList';

/** `membershipApplication` stands in for any list table; nothing here is its own. */

describe('pagedList', () => {
	test('the total counts the rows the filter matches, not the table', async () => {
		await insertApplication({ name: 'Ada' });
		await insertApplication({ name: 'Mia', status: 'declined' });
		await insertApplication({ name: 'Zed', status: 'declined' });

		const { rows, rowCount } = await pagedList(membershipApplication, {
			where: eq(membershipApplication.status, 'declined'),
			sort: membershipApplication.name,
			direction: 'asc',
			page: 0,
		});

		expect(rows.map((row) => row.name)).toEqual(['Mia', 'Zed']);
		expect(rowCount).toBe(2);
		await expect(countRows(membershipApplication)).resolves.toBe(3);
	});

	test('the next page continues the last one under a sort that is all ties', async () => {
		// Every row has the same `status`, so only the id tie-break separates
		// them: without it a row can appear on both pages or on neither.
		for (const name of ['Ada', 'Bea', 'Cai', 'Dee', 'Eli', 'Fay']) {
			await insertApplication({ name });
		}

		const page = async (index: number) => {
			const { rows, rowCount } = await pagedList(membershipApplication, {
				where: undefined,
				sort: membershipApplication.status,
				direction: 'desc',
				page: index,
				pageSize: 2,
			});
			expect(rowCount).toBe(6);
			return rows.map((row) => row.name);
		};

		const seen = [...(await page(0)), ...(await page(1)), ...(await page(2))];

		expect(new Set(seen).size).toBe(6);
		expect([...seen].sort()).toEqual([
			'Ada',
			'Bea',
			'Cai',
			'Dee',
			'Eli',
			'Fay',
		]);
	});

	test('the direction flips the sort', async () => {
		await insertApplication({ name: 'Ada' });
		await insertApplication({ name: 'Zed' });
		await insertApplication({ name: 'Mia' });

		const names = async (direction: 'asc' | 'desc') => {
			const { rows } = await pagedList(membershipApplication, {
				where: undefined,
				sort: membershipApplication.name,
				direction,
				page: 0,
			});
			return rows.map((row) => row.name);
		};

		await expect(names('asc')).resolves.toEqual(['Ada', 'Mia', 'Zed']);
		await expect(names('desc')).resolves.toEqual(['Zed', 'Mia', 'Ada']);
	});

	test('a leading term orders ahead of the sort', async () => {
		await insertApplication({ name: 'Ada' });
		await insertApplication({ name: 'Zed', isPriority: true });
		await insertApplication({ name: 'Mia' });

		const { rows } = await pagedList(membershipApplication, {
			where: undefined,
			sort: membershipApplication.name,
			direction: 'asc',
			leading: [desc(membershipApplication.isPriority)],
			page: 0,
		});

		expect(rows.map((row) => row.name)).toEqual(['Zed', 'Ada', 'Mia']);
	});
});

describe('countRows', () => {
	test('an empty table is nought, not undefined', async () => {
		await expect(countRows(membershipApplication)).resolves.toBe(0);
	});
});
