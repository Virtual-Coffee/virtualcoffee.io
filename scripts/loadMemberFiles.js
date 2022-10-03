var fs = require('fs');

function loadMemberFiles(dir) {
	const filenames = [];

	fs.readdirSync(`./members/${dir}`, { withFileTypes: true }).forEach(
		(file) => {
			if (file.isFile() && file.name.endsWith('.ts')) {
				filenames.push(file.name.replace('.ts', ''));
			}
		},
	);

	fs.writeFileSync(
		`./netlify/functions/data-members/${dir}.ts`,
		filenames
			.map((name) => `export * from '../../../members/${dir}/${name}';`, 'utf8')
			.join('\n'),
		'utf8',
	);
}

loadMemberFiles('core');
loadMemberFiles('members');
