export function qualifiedUrl(path = '') {
	if (!process.env.NETLIFY) {
		return path;
	}

	const baseUrl =
		process.env.CONTEXT === 'production'
			? process.env.URL
			: process.env.DEPLOY_PRIME_URL;

	return baseUrl ? baseUrl + path : path;
}
