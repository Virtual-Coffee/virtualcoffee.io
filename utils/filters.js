const { DateTime } = require('luxon');
const fs = require('fs');

module.exports = function (eleventyConfig) {
	eleventyConfig.addFilter(
		'dateForDisplay',
		(dateString, format = 'fff', opts = {}) => {
			const resolvedOptions = {
				...opts,
			};
			let d = dateString;
			if (typeof d === 'object' && d.toISOString) {
				d = d.toISOString();
			}
			return DateTime.fromISO(d)
				.setZone('America/New_York')
				.toFormat(format, resolvedOptions);
		},
	);

	eleventyConfig.addFilter('toLocaleString', (number, locale = 'en-US') => {
		const parsed = parseFloat(number);
		return isNaN(parsed) ? number : parsed.toLocaleString(locale);
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter('head', (array, n) => {
		if (n < 0) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	eleventyConfig.addFilter('assetPath', function (value) {
		if (process.env.ELEVENTY_ENV === 'production') {
			const manifestPath = 'assets.json';
			const manifest = JSON.parse(fs.readFileSync(manifestPath));
			return manifest[value] ? manifest[value] : value;
		}
		return value;
	});

	eleventyConfig.addFilter('qualifiedUrl', function (path) {
		if (!process.env.NETLIFY) {
			return path;
		}

		const baseUrl =
			process.env.CONTEXT === 'production'
				? process.env.URL
				: process.env.DEPLOY_PRIME_URL;

		return baseUrl ? baseUrl + path : path;
	});

	function navigationList(items) {
		return `<ul class="postlist">
    ${items
			.map(
				(post) => `<li class="postlist-item">
<a class="postlist-title" href="${post.url}">${post.title || post.key}</a>
${post.excerpt ? `<p class="postlist-description">${post.excerpt}</p>` : ''}
${!!post.children && post.children.length ? navigationList(post.children) : ''}
</li>`,
			)
			.join(' ')}
</ul>`;
	}

	eleventyConfig.addFilter('displayNavigationList', function (navigationItems) {
		return navigationList(navigationItems);
	});
};
