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
