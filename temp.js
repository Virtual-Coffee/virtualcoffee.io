const { mkdirSync, readdirSync, renameSync } = require('fs');
const { join } = require('path');

const basePath = join(process.cwd(), 'src', 'app', 'monthlychallenges');

// Get the directory entries (files and directories) inside the base path
const dirEntries = readdirSync(basePath, { withFileTypes: true });

const files = dirEntries.filter(
	(entry) => entry.isFile() && entry.name.endsWith('.jsx'),
);

files.forEach((file) => {
	const newDirName = join(basePath, file.name.replace('.jsx', ''));
	mkdirSync(newDirName);
	renameSync(join(basePath, file.name), join(newDirName, 'page.tsx'));
});
