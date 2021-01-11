module.exports = function () {
  const { challengedata } = require('./jan-2021.json');

  let totals = {};

  challengedata.forEach((challenge, i) => {
    challenge.participants.forEach((p) => {
      if (p in totals) {
        totals[p] = totals[p] + 1;
      } else {
        totals[p] = 1;
      }
    });
  });

  return {
    list: challengedata,
    totals,
  };
};
