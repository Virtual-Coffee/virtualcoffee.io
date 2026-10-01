import { expect, test } from 'vitest';
import { dataCollection } from './sentryDataCollection';

// A failing test here is a privacy policy change, not a config tweak:
// loosening any of these needs ADR 0015 rewritten first.
test('the Sentry baseline keeps request data out', () => {
	const ipParams = { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] };
	expect(dataCollection).toStrictEqual({
		userInfo: false,
		cookies: false,
		httpHeaders: { request: { allow: ['user-agent'] }, response: false },
		httpBodies: [],
		urlQueryParams: ipParams,
		genAI: { inputs: false, outputs: false },
		databaseQueryData: false,
		queues: false,
		graphQL: { document: false, variables: false },
		stackFrameVariables: true,
	});
});
