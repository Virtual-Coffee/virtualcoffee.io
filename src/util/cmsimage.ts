import ImgixClient from '@imgix/js-core';

/**
 * It takes a path and folder and returns a URL to an image on Imgix
 * @returns A URL to the Imgix image
 * @example
 * ```typescript
 * const result = createCmsImage({
 * 				path: 'sample.png',
 * 				folder: 'wicker-baskets'})
 * console.log(result)
 * // => "https://example.imgix.net/wicker-baskets/sample.png?[...misc Imgix params]"
 * ```
 */
export default function createCmsImage({
	path,
	folder,
	settings = {},
}: CreateCmsImageProps) {
	const client = new ImgixClient({
		domain: 'virtualcoffeeio-cms.imgix.net',
	});

	return client.buildURL(`/${folder}/${path}`, {
		auto: 'compress,format',
		...settings,
	});
}

type CreateCmsImageProps = {
	/** The image file name */
	path: string;
	/** The preceding directory/directories before the file name */
	folder: string;
	/** Any other {@link https://docs.imgix.com/apis/rendering rendering options} for the Imgix library
	 * @defaultValue `{}`
	 */
	settings?: Record<string, unknown>;
};

createCmsImage({ path: '', folder: '', settings: {} });
