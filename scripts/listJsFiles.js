var { join } = require('path');
var fs = require('fs');

const filenames = [];

function readDir(path) {
	fs.readdirSync(path, { withFileTypes: true }).forEach((file) => {
		if (
			file.isFile() &&
			(file.name.endsWith('.js') || file.name.endsWith('.jsx'))
		) {
			filenames.push(join(path, file.name));
		} else if (file.isDirectory()) {
			readDir(join(path, file.name));
		}
	});
}

readDir(`./app`);

console.log(filenames);
