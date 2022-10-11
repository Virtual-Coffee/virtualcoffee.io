import ImgixClient from '@imgix/js-core';

/**
 * It takes a path and folder and returns a URL to an image on Imgix
 * @arg {CreateCmsImageProps} - path, folder, and (optional) settings
 * @prop {string} `path` - the image file name
 * @prop {string} `folder` - the preceding directory/directories before the file name
 * @prop {object} [`settings`={}] - any other {@link https://docs.imgix.com/apis/rendering rendering options} for the Imgix library
 * @returns A URL to the image
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

/**
 * Properties for the `createCmsImage` function
 * @property {string} `path` - the image file name
 * @property {string} `folder` - the preceding directory/directories before the file name
 * @property {object} [`settings`={}] - any other {@link https://docs.imgix.com/apis/rendering rendering options} for the Imgix library
 */
type CreateCmsImageProps = {
	path: string;
	folder: string;
	settings?: Record<string, any>;
};
