import { describe, expect, test } from 'vitest';

import { isLocalDatabaseUrl } from './localOnly';

describe('isLocalDatabaseUrl', () => {
	test.each([
		'postgresql://postgres:postgres@localhost:56789/postgres',
		'postgres://u:p@127.0.0.1:5432/db',
		'postgres://u:p@[::1]:5432/db',
	])('accepts %s', (url) => {
		expect(isLocalDatabaseUrl(url)).toBe(true);
	});

	/** The guard exists so a seed or import can never reach production. */
	test.each([
		'postgresql://user:pw@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require',
		'postgres://u:p@localhost.evil.test/db',
		'postgres://u:p@db.internal/db?application_name=localhost',
		'not a url',
		'',
	])('refuses %s', (url) => {
		expect(isLocalDatabaseUrl(url)).toBe(false);
	});
});
