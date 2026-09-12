import { expect, test } from 'vitest';

import { isUniqueViolation } from './errors';

test('recognises the driver code directly and behind a wrapper', () => {
	const raw = Object.assign(new Error('duplicate key'), { code: '23505' });
	expect(isUniqueViolation(raw)).toBe(true);
	expect(isUniqueViolation(new Error('Failed query', { cause: raw }))).toBe(
		true,
	);
});

test('anything else is not a unique violation', () => {
	expect(isUniqueViolation(new Error('connection refused'))).toBe(false);
	expect(
		isUniqueViolation(Object.assign(new Error('bad uuid'), { code: '22P02' })),
	).toBe(false);
	expect(isUniqueViolation(null)).toBe(false);
	expect(isUniqueViolation('23505')).toBe(false);
});
