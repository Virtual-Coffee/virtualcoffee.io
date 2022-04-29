export function qualifiedUrl(path = '') {
	if (!process.env.NETLIFY) {
		return process.env.URL ? process.env.URL + path : path;
	}

	const baseUrl =
		process.env.CONTEXT === 'production'
			? process.env.URL
			: process.env.DEPLOY_PRIME_URL;

	return baseUrl ? baseUrl + path : path;
}

export function qualifiedUrlInfo() {
	return {
		NETLIFY: process.env.NETLIFY,
		URL: process.env.URL,
		DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
		CONTEXT: process.env.CONTEXT,
	};
}
