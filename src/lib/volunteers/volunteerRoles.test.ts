import { expect, test } from 'vitest';

import { formatRoleLabels, parseRoleLabels } from './volunteerRoles';

test('parseRoleLabels splits the column and keeps names not on the list', () => {
	expect(parseRoleLabels(' VC Host , Notetaker,, Maintainer ')).toEqual([
		'VC Host',
		'Notetaker',
		'Maintainer',
	]);
	expect(parseRoleLabels(null)).toEqual([]);
});

test('formatRoleLabels dedupes, orders like the list and is null when empty', () => {
	expect(formatRoleLabels(['VC Host', 'Notetaker', 'VC Host'])).toBe(
		'Notetaker, VC Host',
	);
	expect(formatRoleLabels([])).toBeNull();
});
