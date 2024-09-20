/** @type {import('next').NextConfig} */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);

const nextConfig = {
	sassOptions: {
		includePaths: [path.join(__dirname, 'node_modules')],
	},
};

export default nextConfig;
