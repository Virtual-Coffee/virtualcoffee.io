import * as notify from './notify';
import * as slackDm from './slackDm';
import * as staleRead from './staleRead';
import * as transport from './transport';

/**
 * Resets every shared mock's knobs. `src/test/db/setup.ts` calls this before
 * each test: the db project runs without isolation, so a mock module is
 * evaluated once per run and a `beforeEach` inside it would bind to the first
 * file only.
 */
export function resetMocks() {
	notify.reset();
	slackDm.reset();
	staleRead.reset();
	transport.reset();
}
