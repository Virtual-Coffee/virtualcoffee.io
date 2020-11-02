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
    feed: {
      subtitle: 'An intimate community for all devs, optimized for you',
      filename: 'feed.xml',
      path: '/feed/feed.xml',
      id: baseUrl,
    },
    jsonfeed: {
      path: '/feed/feed.json',
      url: `${baseUrl}/feed/feed.json`,
    },
    author: {
      name: 'Virtual Coffee',
      email: 'hello@virtualcoffee.io',
      url: baseUrl,
    },
  };
};
