import { imageSize } from 'image-size';
import * as fs from 'fs';
import path from 'path';
import recursive from 'recursive-readdir';

const outputFile = path.resolve('app/_generatedData/aspectRatios.ts');
const inputDir = path.resolve('public/assets');

const supportedTypes = [
	'.bmp',
	'.cur',
	'.dds',
	'.gif',
	'.icns',
	'.ico',
	'.j2c',
	'.jp2',
	'.jpeg',
	'.ktx',
	'.png',
	'.pnm',
	'.pam',
	'.pbm',
	'.pfm',
	'.pgm',
	'.ppm',
	'.psd',
	'.svg',
	'.tga',
	'.tiff',
	'.webp',
];

const getFiles = async (dir: string) => {
	const outFiles: string[] = [];
	const fileList = await recursive(dir);
	fileList.forEach((fname) => {
		const fileExt = path.extname(fname);
		if (supportedTypes.includes(fileExt.toLowerCase())) {
			outFiles.push(fname);
		}
	});
	return outFiles;
};

const getAspectRatio = (file: string) => {
	const { height, width } = imageSize(file);
	return { width, height };
};

const generateAspectDefFile = async (dir: string) => {
	let ratioMap: Map<string, string> = new Map();
	const files = await getFiles(dir);
	for (let file of files) {
		const { height, width } = getAspectRatio(file);
		const filename = `/${file.substring(file.lastIndexOf('public/') + 7)}`;
		ratioMap.set(filename, `${width} / ${height}`);
	}
	const ratioObj = Object.fromEntries(ratioMap);
	fs.writeFileSync(
		outputFile,
		`export const aspectRatios = ${JSON.stringify(
			ratioObj,
			null,
			2,
		)} as Record<string, string>`,
	);
};

await generateAspectDefFile(inputDir);
