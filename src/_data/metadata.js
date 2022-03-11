module.exports = function () {
	const baseUrl = process.env.NETLIFY
		? process.env.CONTEXT === 'production'
			? process.env.URL
			: process.env.DEPLOY_PRIME_URL
		: '';

	return {
		title: 'Virtual Coffee',
		url: baseUrl,
		description: 'An intimate community for all devs, optimized for you',
		tags: {
			'og:type': 'website',
			'og:image': '/assets/images/vc-social-card.png',
			'twitter:card': 'summary_large_image',
			'twitter:image': '/assets/images/vc-social-card.png',
		},
	};
};
