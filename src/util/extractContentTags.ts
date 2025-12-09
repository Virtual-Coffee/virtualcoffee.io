import { MdxFile } from './loadMdx.server';

/**
 * Recursively extracts all contentTags from an array of MdxFile objects and their children.
 * @param mdxFiles - Array of MdxFile objects to extract contentTags from
 * @returns Array of unique contentTags found in all files and their children
 */
export function extractAllContentTags(mdxFiles: MdxFile[]): string[] {
	const allContentTags = new Set<string>();

	/**
	 * Recursive helper function to process a single MdxFile and its children
	 * @param mdxFile - The MdxFile to process
	 */
	function processMdxFile(mdxFile: MdxFile): void {
		if (mdxFile.contentTags && Array.isArray(mdxFile.contentTags)) {
			mdxFile.contentTags.forEach((tag) => allContentTags.add(tag));
		}

		if (mdxFile.children && Array.isArray(mdxFile.children)) {
			mdxFile.children.forEach((child) => processMdxFile(child));
		}
	}

	mdxFiles.forEach((mdxFile) => processMdxFile(mdxFile));

	return Array.from(allContentTags).sort();
}
