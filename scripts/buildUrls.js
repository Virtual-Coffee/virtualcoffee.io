'use strict';

const fs = require('fs');
const { join } = require('path');

require('dotenv').config();

function main() {
	const buildUrls = {
		NETLIFY: process.env.NETLIFY,
		URL: process.env.URL,
		DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
		CONTEXT: process.env.CONTEXT,
	};

	fs.writeFileSync(
		join(process.cwd(), 'app', '_generatedData', 'buildUrls.json'),
		JSON.stringify(buildUrls),
	);
}

main();
