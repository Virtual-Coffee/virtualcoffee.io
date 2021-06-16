const ImgixClient = require('@imgix/js-core');

const useImgix =
  process.env.USE_IMGIX || process.env.ELEVENTY_ENV === 'production';

var imgixClient = new ImgixClient({
  domain: 'virtualcoffee.imgix.net',
});

module.exports = function (eleventyConfig) {
  const defaultImgixParams = {
    auto: 'compress,format',
  };

  eleventyConfig.addFilter('buildImgixUrl', function (path, params = {}) {
    if (useImgix) {
      return imgixClient.buildURL(path, {
        ...defaultImgixParams,
        ...params,
      });
    }
    return path;
  });

  eleventyConfig.addFilter(
    'buildImgixSrcSet',
    function (path, widths, params = {}, options = {}) {
      if (useImgix) {
        return imgixClient.buildSrcSet(
          path,
          {
            ...defaultImgixParams,
            ...params,
          },
          {
            widths,
            ...options,
          }
        );
      }

      return widths && widths.map
        ? widths.map((w) => `${path} ${w}w`).join(',')
        : '';
    }
  );
};
