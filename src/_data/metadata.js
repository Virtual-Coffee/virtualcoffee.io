module.exports = function () {
  return {
    title: 'Virtual Coffee',
    url: process.env.DEPLOY_PRIME_URL,
    description: 'An intimate community for all devs, optimized for you',
    feed: {
      subtitle: 'An intimate community for all devs, optimized for you',
      filename: 'feed.xml',
      path: '/feed/feed.xml',
      id: process.env.DEPLOY_PRIME_URL,
    },
    jsonfeed: {
      path: '/feed/feed.json',
      url: `${process.env.DEPLOY_PRIME_URL}/feed/feed.json`,
    },
    author: {
      name: 'Virtual Coffee',
      email: 'hello@virtualcoffee.io',
      url: process.env.DEPLOY_PRIME_URL,
    },
  };
};
