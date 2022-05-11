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
		txtsize: 74,
		w: 1100,
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
		w: 1100,
		txtcolor: 'ffffff',
		txtfont64: 'Avenir Next Medium',
		txt64: subtitle,
		txtshad: 3,

		// bg: 'f00',
	});

	return client.buildURL('/assets/images/share-card-background-6.png', {
		w: 1200,
		h: 628,
		mark64: header,
		markx: 50,
		markalign: 'bottom',
		markh: 203,
		markpad: 375,
		markfit: 'max',
		blend64: subheader,
		blendmode: 'normal',
		blendx: 50,
		blendy: 243,
		// border: '10,99ffffff',
		border: '10,66000000',
	});
}
