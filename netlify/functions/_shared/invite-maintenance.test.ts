import { expect, test } from 'vitest';

/**
 * Lives in _shared/ rather than beside the function: Netlify bundles every
 * top-level file in netlify/functions/ as a function, and would try to deploy
 * `invite-maintenance.test`. Subdirectories without an index are ignored.
 */
import { config } from '../invite-maintenance';

test('the scheduled function runs daily', () => {
	expect(config).toEqual({ schedule: '@daily' });
});
