import { env } from 'cloudflare:workers';

export function qualifiedUrl(path = '') {
	const baseUrl = env.SITE_URL;
	return baseUrl ? baseUrl + path : path;
}
