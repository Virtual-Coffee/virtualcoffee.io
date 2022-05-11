import ImgixClient from '@imgix/js-core';

export default function createSocialImage({ title, subtitle }) {
	const client = new ImgixClient({
		domain: 'virtualcoffee.imgix.net',
		// secureURLToken: '<SECURE TOKEN>',
	});

	const client2 = new ImgixClient({
		domain: 'assets.imgix.net',
	});

	const header = client2.buildURL('~text', {
		txtlead: -20,
		txtsize: 68,
		w: 800,
		txtcolor: 'ffffff',
		txtfont64: 'Avenir Next Condensed Heavy',
		txt64: title,
		minh: 203,
		txtshad: 2,
		// h: 203,
		// bg: 'ff0',
	});

	const subheader = client2.buildURL('~text', {
		txtlead: -10,
		txtsize: 42,
		w: 800,
		txtcolor: 'ffffff',
		txtfont64: 'Avenir Next Medium',
		txt64: subtitle,
		txtshad: 3,

		// bg: 'f00',
	});

	const headerContainer = client.buildURL('/assets/images/1x1.png', {
		w: 800,
		h: 314,
		fit: 'crop',
		mark64: header,
		markalign: 'left,bottom',
		markh: 264,
		markfit: 'max',
		// bg: '00f',
	});

	const subheaderContainer = client.buildURL('/assets/images/1x1.png', {
		w: 800,
		h: 314,
		fit: 'crop',
		mark64: subheader,
		markalign: 'left,top',
	});

	const textlayer = client.buildURL('/assets/images/1x1.png', {
		w: 1200,
		h: 628,
		fit: 'crop',
		mark64: headerContainer,
		markx: 340,
		marky: 15,
		blend64: subheaderContainer,
		blendmode: 'normal',
		blendx: 340,
		blendy: 299,
	});

	const logolayer = client.buildURL('/assets/images/1x1.png', {
		w: 1200,
		h: 628,
		fit: 'crop',
		mark64: textlayer,
		markx: 0,
		marky: 0,
		blend64: '/assets/images/virtual-coffee-io-full-t.png',
		blendmode: 'normal',
		blendalign: 'bottom,right',
		blendpad: 20,
		blendw: 400,
	});

	const full = client.buildURL(
		'/assets/images/share-card-background-blank.png',
		{
			w: 1200,
			h: 628,
			mark64: logolayer,
			markx: 0,
			marky: 0,
			blend64: '/assets/images/virtual-coffee-mug-gray-white.png',
			blendx: 60,
			blendalign: 'middle',
			blendw: 250,
			blendh: 250,
			blendfit: 'max',
			blendmode: 'normal',

			// border: '10,99ffffff',
			border: '10,66000000',
		},
	);

	return full;
}
