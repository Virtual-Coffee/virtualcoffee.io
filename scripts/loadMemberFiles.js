var fs = require('fs');

function loadMemberFiles(dir) {
	const filenames = [];

	fs.readdirSync(`./src/content/members/${dir}`, {
		withFileTypes: true,
	}).forEach((file) => {
		if (
			file.isFile() &&
			file.name.endsWith('.ts') &&
			file.name !== '_EXAMPLE.ts'
		) {
			filenames.push(file.name.replace('.ts', ''));
		}
	});

	fs.writeFileSync(
		`./src/data/members/${dir}.ts`,
		filenames
			.map(
				(name) => `export * from '@/content/members/${dir}/${name}';`,
				'utf8',
			)
			.join('\n'),
		'utf8',
	);
}

loadMemberFiles('core');
loadMemberFiles('members');
