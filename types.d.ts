declare module 'directory-import' {
	type ImportDirParams = {
		/**
		 * Relative path to directory
		 * @default './'
		 */
		directoryPath?: string;

		/**
		 * If false — files in subdirectories will not be imported
		 * @default true
		 */
		includeSubdirectories?: boolean;
		/**
		 * Webpack support.
		 * @default false
		 */
		webpack?: boolean;
		/**
		 * Indicates how many files to import. 0 - to disable the limit
		 * @default 0
		 */
		limit?: number;
		/**
		 * Exclude files paths.
		 * @default undefined
		 */
		exclude?: RegExp;
	};

	type WithImportAsync = {
		/**
		 * Import files synchronously, or asynchronously
		 * @default 'sync'
		 */
		importMethod?: 'async';
	};

	type WithImportSync = {
		/**
		 * Import files synchronously, or asynchronously
		 * @default 'sync'
		 */
		importMethod?: 'sync';
	};

	function importDir<T>(
		parameters: ImportDirParams & WithImportSync,
	): Record<string, T>;

	function importDir<T>(
		parameters: ImportDirParams & WithImportAsync,
	): Promise<Record<string, T>>;

	export = importDir;
}
