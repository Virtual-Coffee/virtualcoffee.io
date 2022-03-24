const { loadUserData } = require('../app/data/members');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = async function () {
	const userData = await loadUserData();

	fs.writeFileSync(
		path.resolve(__dirname, '..', 'app', '_generatedData', 'members.json'),
		JSON.stringify(userData, null, 2),
	);
};
