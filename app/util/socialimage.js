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
		txtsize: '84',
		w: 1170,
		txtcolor: 'ffffff',
		txtfont64: 'Avenir Next Condensed Heavy',
		txt64: title,
		// h: 230,
		// bg: 'ff0',
	});

	const subheader = client2.buildURL('~text', {
		txtlead: -10,
		txtsize: '48',
		w: '1170',
		txtcolor: '202020',
		txtfont64: 'Avenir Next Regular',
		txt64: subtitle,
		// bg: 'f00',
	});

	const mask1 = client.buildURL('/assets/images/black.png', {
		w: 1200,
		h: 628,
		mark64: header,
		markx: 15,
		markalign: 'bottom',
		markh: 230,
		markpad: 383,
	});

	const masked = client.buildURL('/assets/images/textmask.png', {
		w: 1200,
		h: 628,
		mask64: mask1,
	});

	client.buildURL('/assets/images/share-card-background-3.png', {
		w: 1200,
		h: 628,
		mark64: masked,
		markx: 0,
		marky: 0,
		blend64: subheader,
		blendmode: 'normal',
		blendx: 15,
		blendy: 230,
	});
}
