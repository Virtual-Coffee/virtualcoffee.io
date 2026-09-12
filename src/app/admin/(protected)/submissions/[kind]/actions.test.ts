import { afterEach, describe, expect, test, vi } from 'vitest';

import { NOT_FOUND } from '@/test/next';
import { signInAs } from '@/test/session';
import { addSubmissionNote, setSubmissionStatus } from './actions';

describe('authorisation is per kind', () => {
	afterEach(() => vi.unstubAllEnvs());

	test('an unknown kind is refused before any permission check', async () => {
		// No session at all: reaching requirePermission() would throw.
		await expect(setSubmissionStatus('nope', 'x', 'new')).resolves.toEqual({
			ok: false,
			message: 'Unknown submission type.',
		});
		await expect(addSubmissionNote('nope', 'x', 'hi')).resolves.toEqual({
			ok: false,
			message: 'Unknown submission type.',
		});
	});

	test('a role for one section 404s on another', async () => {
		signInAs('volunteer_coordinator');
		await expect(
			setSubmissionStatus('coc', 'x', 'resolved'),
		).rejects.toMatchObject(NOT_FOUND);
	});

	test('the status and the id are checked before the database', async () => {
		signInAs('coc_reviewer');
		await expect(setSubmissionStatus('coc', 'x', 'done')).resolves.toEqual({
			ok: false,
			message: 'Unknown status.',
		});
		await expect(
			setSubmissionStatus('coc', 'not-an-id', 'resolved'),
		).resolves.toEqual({
			ok: false,
			message: 'That submission no longer exists.',
		});
	});
});
