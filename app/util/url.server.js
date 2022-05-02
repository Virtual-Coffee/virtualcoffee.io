import buildUrls from '../_generatedData/buildUrls.json';

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
