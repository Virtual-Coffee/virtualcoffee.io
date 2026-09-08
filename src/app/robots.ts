import type { MetadataRoute } from 'next';
import { allowedUas, blockedUas, robotsOnlyUas } from '@/data/bots';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			// Stated explicitly rather than left to the `*` rule below, so that
			// allowing an AI search crawler is a decision someone can read here.
			{ userAgent: allowedUas, allow: '/' },
			{ userAgent: [...blockedUas, ...robotsOnlyUas], disallow: '/' },
			{ userAgent: '*', disallow: ['/_cache', '/api/'] },
		],
	};
}
