import type { DatabaseConnection } from '@netlify/database';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/netlify-db';
import { expect, test } from 'vitest';
import { z } from 'zod';

import { type Database, withQueryCall } from './index';

function fakeServerless() {
	const calls: unknown[][] = [];
	const httpClient = Object.assign(
		() => {
			throw new Error(
				'This function can now be called only as a tagged-template function',
			);
		},
		{
			query: (...args: unknown[]) => {
				calls.push(args);
				return Promise.resolve({ rows: [], fields: [], rowCount: 0 });
			},
		},
	);
	const client = {
		driver: 'serverless',
		httpClient,
		pool: {},
		connectionString: 'postgres://fake',
	} as unknown as DatabaseConnection;
	return { client, calls };
}

test('a serverless query reaches the client through .query', async () => {
	const { client, calls } = fakeServerless();

	const db: Database = drizzle({ client: withQueryCall(client) });
	await db.execute(sql`select ${1}`);

	expect(calls).toEqual([
		[
			expect.schemaMatching(z.string().startsWith('select')),
			[1],
			expect.objectContaining({ fullResults: true }),
		],
	]);
});

test('the server driver is passed through untouched', () => {
	const client = { driver: 'server' } as unknown as DatabaseConnection;
	expect(withQueryCall(client)).toBe(client);
});
