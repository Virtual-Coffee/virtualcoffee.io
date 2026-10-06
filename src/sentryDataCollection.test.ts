import { describe, expect, test } from 'vitest';
import {
	dataCollection,
	PII_ROUTES,
	underPiiRoute,
	withoutPiiFrameVars,
} from './sentryDataCollection';

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

describe('withoutPiiFrameVars', () => {
	function event(at: {
		url?: string;
		transaction?: string;
		reported?: string;
	}) {
		return {
			type: undefined,
			request: at.url ? { url: at.url } : undefined,
			transaction: at.transaction,
			tags: at.reported ? { reported: at.reported } : undefined,
			exception: {
				values: [
					{
						stacktrace: {
							frames: [
								{ function: 'action', vars: { email: 'ada@example.test' } },
								{ function: 'save', vars: { body: 'what happened' } },
							],
						},
					},
				],
			},
		};
	}

	const vars = (e: ReturnType<typeof event>) =>
		e.exception.values[0].stacktrace.frames.map((frame) => frame.vars);

	test('an event reportHandled sent loses every frame’s locals, whatever the route', () => {
		const e = withoutPiiFrameVars(
			event({ url: 'https://virtualcoffee.io/', reported: 'handled' }),
		) as ReturnType<typeof event>;
		expect(vars(e)).toEqual([undefined, undefined]);
	});

	test.each(PII_ROUTES.flatMap((route) => [route, `${route}/x/y`]))(
		'%s loses its locals, by request URL or by transaction',
		(path) => {
			const byUrl = withoutPiiFrameVars(
				event({ url: `https://virtualcoffee.io${path}?a=1` }),
			) as ReturnType<typeof event>;
			expect(vars(byUrl)).toEqual([undefined, undefined]);

			const byTransaction = withoutPiiFrameVars(
				event({ transaction: `POST ${path}` }),
			) as ReturnType<typeof event>;
			expect(vars(byTransaction)).toEqual([undefined, undefined]);
		},
	);

	test.each([
		{ url: 'https://virtualcoffee.io/resources/joining' },
		{ url: 'https://virtualcoffee.io/joined' },
		{ transaction: 'GET /members' },
		{ reported: 'unhandled' },
	])('elsewhere the locals stay (%o)', (at) => {
		const e = withoutPiiFrameVars(event(at)) as ReturnType<typeof event>;
		expect(vars(e)).toEqual([
			{ email: 'ada@example.test' },
			{ body: 'what happened' },
		]);
	});
});

describe('underPiiRoute', () => {
	test.each([
		['/report-coc-violation', true],
		['/admin/events/series/new', true],
		['/join', true],
		['/joined', false],
		['/resources/joining', false],
		[undefined, false],
	])('%s -> %s', (path, expected) => {
		expect(underPiiRoute(path)).toBe(expected);
	});
});
