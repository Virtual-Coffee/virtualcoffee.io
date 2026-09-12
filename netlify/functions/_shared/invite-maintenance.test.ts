import { describe, expect, test, vi } from 'vitest';

/**
 * Lives in _shared/ rather than beside the function: Netlify bundles every
 * top-level file in netlify/functions/ as a function, and would try to deploy
 * `invite-maintenance.test`. Subdirectories without an index are ignored.
 */
const runInviteMaintenance = vi.hoisted(() => vi.fn());
vi.mock('./inviteMaintenance', () => ({ runInviteMaintenance }));

import handler, { config } from '../invite-maintenance';

describe('the scheduled function', () => {
	test('runs daily', () => {
		expect(config).toEqual({ schedule: '@daily' });
	});

	test('logs the report on success', async () => {
		const log = vi.spyOn(console, 'log').mockImplementation(() => {});
		runInviteMaintenance.mockResolvedValueOnce({ period: '2026-09' });

		await expect(handler()).resolves.toBeUndefined();
		expect(log).toHaveBeenCalledWith('Invite maintenance', {
			period: '2026-09',
		});
		log.mockRestore();
	});

	test('rethrows a failure so Netlify retries it', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		runInviteMaintenance.mockRejectedValueOnce(new Error('db away'));

		await expect(handler()).rejects.toThrow('db away');
		expect(error).toHaveBeenCalled();
		error.mockRestore();
	});
});
