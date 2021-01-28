module.exports = function () {
  const { challengedata } = require('./jan-2021.json');
  challengedata.forEach(function (person) {
    const p = {
      name: person.name
    };
  });
  return {
    list: challengedata,
    sortedList: challengedata.sort((a, b) => a.name.localeCompare(b.name)),

  };
}
