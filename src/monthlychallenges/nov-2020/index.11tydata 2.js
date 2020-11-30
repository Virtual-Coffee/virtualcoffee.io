module.exports = function () {
  const totals = [];
  let totalCount = 0;
  let totalPosts = 0;
  const { challengedata } = require('./nov-2020.json');

  challengedata.forEach(function (person) {
    const p = {
      name: person.name,
      posts: person.posts.length,
      total: person.posts.reduce((total, post) => total + post.count, 0),
    };

    totalCount = totalCount + p.total;
    totalPosts = totalPosts + p.posts;
    totals.push(p);
  });

  return {
    sortedList: challengedata.sort((a, b) => a.name.localeCompare(b.name)),
    totals: {
      list: totals.sort((a, b) => b.total - a.total),
      totalCount,
      totalPosts,
    },
  };
};
