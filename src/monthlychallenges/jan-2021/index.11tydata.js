module.exports = function () {
	const { challengedata } = require('./jan-2021.json');

	return {
		list: challengedata.sort((a, b) => a.name.localeCompare(b.name)),
	};
};
