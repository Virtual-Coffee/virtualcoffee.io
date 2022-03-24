const buildMembers = require('./members');

async function main() {
	const members = buildMembers();

	await Promise.all([members]);
}

main();
