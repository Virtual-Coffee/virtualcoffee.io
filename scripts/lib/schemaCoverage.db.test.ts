import { sql } from 'drizzle-orm';
import { afterEach, describe, expect, test } from 'vitest';

import { db } from '@/db';

import { coverageFailures } from './schemaCoverage';

/**
 * Against the real migrations, as `globalSetup` applies them: the list and
 * the schema have to agree, in both directions, or the preview build fails.
 */
describe('coverageFailures', () => {
	afterEach(async () => {
		await db().execute(sql`drop table if exists "audit_trail"`);
		await db().execute(
			sql`alter table "volunteer" drop column if exists "phone"`,
		);
		await db().execute(
			sql`alter table "volunteer" add column if not exists "role_labels" text`,
		);
	});

	test('the migrated schema and the list agree', async () => {
		await expect(coverageFailures(db())).resolves.toEqual([]);
	});

	test('a new table is named until someone decides about it', async () => {
		await db().execute(
			sql`create table "audit_trail" (id text primary key, note text)`,
		);
		await expect(coverageFailures(db())).resolves.toEqual([
			'table "audit_trail" is not known to the sanitizer (scripts/lib/schemaCoverage.ts)',
		]);
	});

	test('a new column on a known table is named too', async () => {
		await db().execute(sql`alter table "volunteer" add column "phone" text`);
		await expect(coverageFailures(db())).resolves.toEqual([
			'column "volunteer.phone" is not known to the sanitizer (scripts/lib/schemaCoverage.ts)',
		]);
	});

	test('a listed column the schema has dropped is stale, and said so', async () => {
		await db().execute(sql`alter table "volunteer" drop column "role_labels"`);
		await expect(coverageFailures(db())).resolves.toEqual([
			'column "volunteer.role_labels" is listed in scripts/lib/schemaCoverage.ts but does not exist',
		]);
	});
});
