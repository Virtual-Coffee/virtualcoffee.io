import type { MetadataRoute } from 'next';
import { allowedUas, blockedUas, robotsOnlyUas } from '@/data/bots';

/**
 * Repeated in every group that names an agent, not just the `*` fallback: a
 * crawler obeys only the most specific group it matches, so anything listed
 * below by name never reads the `*` rules at all.
 */
const restrictedPaths = ['/_cache', '/api/'];

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{ userAgent: allowedUas, allow: '/', disallow: restrictedPaths },
			{ userAgent: [...blockedUas, ...robotsOnlyUas], disallow: '/' },
			{ userAgent: '*', disallow: restrictedPaths },
		],
	};
}
