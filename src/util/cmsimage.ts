import ImgixClient from '@imgix/js-core';
import { CMS_IMGIX_HOST } from './imageHosts';

/**
 * The bare CMS image URL, carrying no rendering params.
 * @returns A URL to the Imgix image, with no query string
 * @example
 * ```typescript
 * cmsImageUrl({ path: 'sample.png', folder: 'wicker-baskets' })
 * // => "https://virtualcoffeeio-cms.imgix.net/wicker-baskets/sample.png"
 * ```
 * Use this for the `src` of a {@link import('@/components/CdnImage').default},
 * which adds the sizing params itself for each entry in the generated srcset.
 * {@link createCmsImage} is for URLs that have to be complete on their own,
 * such as OpenGraph metadata.
 */
export function cmsImageUrl({
	path,
	folder,
}: Omit<CreateCmsImageProps, 'settings'>) {
	return `https://${CMS_IMGIX_HOST}/${folder}/${path}`;
}

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
		domain: CMS_IMGIX_HOST,
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
