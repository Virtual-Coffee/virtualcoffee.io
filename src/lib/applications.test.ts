import { describe, expect, test } from 'vitest';

import { getApplication, getApplicationInviter } from './applications';

describe('guards that answer before the database', () => {
	test('a malformed id is null, not a 22P02', async () => {
		await expect(getApplication('42')).resolves.toBeNull();
	});

	test('an application with no invite has no inviter', async () => {
		await expect(getApplicationInviter(null)).resolves.toBeNull();
	});
});
