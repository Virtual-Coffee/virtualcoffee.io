require('dotenv').config();
const { DateTime } = require('luxon');
const fs = require('fs');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginNavigation = require('@11ty/eleventy-navigation');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

module.exports = function (eleventyConfig) {
  eleventyConfig.setWatchThrottleWaitTime(100); // in milliseconds
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);

  require('./utils/imgix')(eleventyConfig);
  require('./utils/shortcodes')(eleventyConfig);

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');

  eleventyConfig.addFilter(
    'dateForDisplay',
    (dateString, format = 'fff', opts = {}) => {
      const resolvedOptions = {
        ...opts,
      };
      return DateTime.fromISO(dateString)
        .setZone('America/New_York')
        .toFormat(format, resolvedOptions);
    }
  );

  eleventyConfig.addCollection('homePageBlocksSmall', function (collectionApi) {
    return collectionApi
      .getAll()
      .filter(
        (post) =>
          post.data.homePageBlocks && post.data.homePageBlocks.type === 'small'
      )
      .sort(
        (a, b) => a.data.homePageBlocks.order - b.data.homePageBlocks.order
      );
  });

  eleventyConfig.addCollection('homePageBlocksLarge', function (collectionApi) {
    return collectionApi
      .getAll()
      .filter(
        (post) =>
          post.data.homePageBlocks && post.data.homePageBlocks.type === 'large'
      )
      .sort(
        (a, b) => a.data.homePageBlocks.order - b.data.homePageBlocks.order
      );
  });

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

  eleventyConfig.addPassthroughCopy('src/img');
  eleventyConfig.addPassthroughCopy('src/service-worker.js');
  eleventyConfig.addPassthroughCopy('src/assets');
  eleventyConfig.addPassthroughCopy('src/css');
  // eleventyConfig.addPassthroughCopy('CODE_OF_CONDUCT.md');

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

  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  });
  // .use(markdownItAnchor, {
  //   permalink: true,
  //   permalinkClass: 'direct-link',
  //   permalinkSymbol: '#',
  // });
  eleventyConfig.setLibrary('md', markdownLibrary);

  // Browsersync Overrides
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware('*', (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false,
  });

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid'],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about those.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`
    // pathPrefix: "/",

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',

    // These are all optional, defaults are shown:
    dir: {
      input: './src',
      includes: '_includes',
      data: '_data',
      output: './_site',
    },
  };
};
