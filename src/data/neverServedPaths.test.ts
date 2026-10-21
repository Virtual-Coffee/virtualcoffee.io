import { describe, expect, test } from 'vitest';
import { isNeverServedPath } from './neverServedPaths';

describe('isNeverServedPath', () => {
	test.each([
		'/.env',
		'/.env.local',
		'/.git/config',
		'/.aws/credentials',
		'/.ssh/id_rsa',
		'/.svn/entries',
		'/.DS_Store',
		'/wp-login.php',
		'/wp-admin/',
		'/xmlrpc.php',
		'/phpinfo.php',
		'/__vite_rsc_findSourceMapURL',
		'/cgi-bin/test.cgi',
		'/default.aspx',
	])('%s is answered at the edge', (pathname) => {
		expect(isNeverServedPath(pathname)).toBe(true);
	});

	test.each([
		'/',
		'/events',
		'/podcast/x',
		'/api/auth/session',
		'/admin',
		'/monitoring',
		'/plausible/x',
		'/.well-known/x',
		'/.netlify/functions/join-coffee',
		'/_next/static/x.js',
		'/assets/x.png',
		'/robots.txt',
		'/sitemap.xml',
		'/__nextjs_source-map',
		'/members',
		'/newsletter/issues/2021-04',
	])('%s reaches Next', (pathname) => {
		expect(isNeverServedPath(pathname)).toBe(false);
	});
});
