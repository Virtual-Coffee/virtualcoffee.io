import type { MetadataRoute } from 'next';
import { botUas, userInitiatedUas } from '@/data/bots';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: botUas.filter((ua) => !userInitiatedUas.includes(ua)),
				disallow: '/',
			},
			{ userAgent: '*', disallow: ['/_cache', '/api/'] },
		],
	};
}
