export const buildUrls: BuildUrls = {
	NETLIFY: process.env.NETLIFY,
	URL: process.env.URL as string,
	DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
	CONTEXT: process.env.CONTEXT,
};

type BuildUrls = {
	URL: string;
	NETLIFY?: string;
	CONTEXT?: string;
	DEPLOY_PRIME_URL?: string;
};

// buildUrls is created in scripts/buildUrls.js at build-time
export function qualifiedUrl(path = '') {
	if (!buildUrls.NETLIFY) {
		return buildUrls.URL ? buildUrls.URL + path : path;
	}

	const baseUrl =
		buildUrls.CONTEXT === 'production'
			? buildUrls.URL
			: buildUrls.DEPLOY_PRIME_URL;

	return baseUrl ? baseUrl + path : path;
}
