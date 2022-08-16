declare module 'directory-import' {
	function importDir(parameters: {
		/**
		 * Relative path to directory
		 */
		directoryPath?: string;
		/**
		 * Import files synchronously, or asynchronously
		 */
		importMethod?: string;
		/**
		 * If false — files in subdirectories will not be imported
		 */
		includeSubdirectories?: boolean;
		/**
		 * Webpack support.
		 */
		webpack?: boolean;
		/**
		 * Indicates how many files to import. 0 - to disable the limit
		 */
		limit?: number;
		/**
		 * Exclude files paths.
		 */
		exclude?: RegExp;
	}): any;

	export = importDir;
}
