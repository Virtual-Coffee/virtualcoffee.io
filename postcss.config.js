module.exports = {
	plugins: [
		require('autoprefixer'),
		require('cssnano')({
			mergeLonghand: false,
			convertValues: false,
			autoprefixer: false,
			discardUnused: false,
			zindex: false,
			mergeIdents: false,
			reduceIdents: false,
			safe: true,
		}), // minify the result

		// require('@fullhuman/postcss-purgecss')({
		//   content: [
		//     './utils/**/*.js',
		//     './.eleventy.js',
		//     './src/**/*.njk',
		//     './src/**/*.md',
		//     './src/**/*.html',
		//     './src/**/*.liquid',
		//     './src/**/*.js',
		//   ],
		// })
	],
};
