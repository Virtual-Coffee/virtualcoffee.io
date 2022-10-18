import buildUrls from '../_generatedData/buildUrls.json';

type BuildUrls = {
	URL: string;
	NETLIFY?: string;
	CONTEXT?: string;
	DEPLOY_PRIME_URL?: string;
};

const validateUrls = (input: BuildUrls) => {
	return {
		URL: input.URL,
		NETLIFY: input.NETLIFY ?? null,
		CONTEXT: input.CONTEXT ?? null,
		DEPLOY_PRIME_URL: input.DEPLOY_PRIME_URL ?? null,
	};
};

const buildUrlsObject = validateUrls(buildUrls);

// buildUrls is created in scripts/buildUrls.js at build-time
export function qualifiedUrl(path = '') {
	if (!buildUrlsObject.NETLIFY) {
		return buildUrls.URL ? buildUrls.URL + path : path;
	}

	const baseUrl =
		buildUrlsObject.CONTEXT === 'production'
			? buildUrlsObject.URL
			: buildUrlsObject.DEPLOY_PRIME_URL;

	return baseUrl ? baseUrl + path : path;
}
