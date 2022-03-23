import sanitize from 'sanitize-html';

export default function sanitizeCmsData(data) {
	if (Array.isArray(data)) {
		return data.map((o) => sanitizeCmsData(o));
	} else if (typeof data === 'object') {
		return Object.keys(data).reduce((obj, key) => {
			if (key === 'renderHtml') {
				return {
					...obj,
					sanitizedHtml: sanitize(data[key], sanitizeOptions),
				};
			} else {
				return {
					...obj,
					[key]: sanitizeCmsData(data[key]),
				};
			}
		}, {});
	} else {
		return data;
	}
}

export function sanitizeHtml(html) {
	return sanitize(html, sanitizeOptions);
}

const sanitizeOptions = {
	allowedTags: [
		'a',
		'img',
		// default options:
		'address',
		'article',
		'aside',
		'footer',
		'header',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'hgroup',
		'main',
		'nav',
		'section',
		'blockquote',
		'dd',
		'div',
		'dl',
		'dt',
		'figcaption',
		'figure',
		'hr',
		'li',
		'main',
		'ol',
		'p',
		'pre',
		'ul',
		'a',
		'abbr',
		'b',
		'bdi',
		'bdo',
		'br',
		'cite',
		'code',
		'data',
		'dfn',
		'em',
		'i',
		'kbd',
		'mark',
		'q',
		'rb',
		'rp',
		'rt',
		'rtc',
		'ruby',
		's',
		'samp',
		'small',
		'span',
		'strong',
		'sub',
		'sup',
		'time',
		'u',
		'var',
		'wbr',
		'caption',
		'col',
		'colgroup',
		'table',
		'tbody',
		'td',
		'tfoot',
		'th',
		'thead',
		'tr',
	],
	disallowedTagsMode: 'discard',
	allowedAttributes: {
		a: ['href', 'name', 'target'],
		// We don't currently allow img itself by default, but
		// these attributes would make sense if we did.
		img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
	},
	// Lots of these won't come up by default because we don't allow them
	selfClosing: [
		'img',
		'br',
		'hr',
		'area',
		'base',
		'basefont',
		'input',
		'link',
		'meta',
	],
	// URL schemes we permit
	allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel'],
	allowedSchemesByTag: {},
	allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
	allowProtocolRelative: true,
	enforceHtmlBoundary: false,
};
