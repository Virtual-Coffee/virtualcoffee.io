import ImgixClient from '@imgix/js-core';

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
	path: string;
	folder: string;
	settings: Record<string, any>;
};
