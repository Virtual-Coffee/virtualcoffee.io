'use client';

import Image, { type ImageLoader, type ImageProps } from 'next/image';
import {
	ASSETS_IMGIX_HOST,
	CMS_IMGIX_HOST,
	GITHUB_AVATAR_HOST,
} from '@/util/imageHosts';

const IMGIX_HOSTS: ReadonlySet<string> = new Set([
	CMS_IMGIX_HOST,
	ASSETS_IMGIX_HOST,
]);

/**
 * imgix rendering API.
 *
 * `w` is *set*, not defaulted. imgix's own Next.js guide writes
 * `params.set('w', params.get('w') || width)`, which keeps a `w` the URL
 * already has — and every URL `createCmsImage` builds carries one, which would
 * pin every srcset entry to a single width. Pass a bare URL as `src` and let
 * this add the params.
 */
const imgixLoader: ImageLoader = ({ src, width, quality }) => {
	const url = new URL(src);
	url.searchParams.set('auto', 'compress,format');
	url.searchParams.set('fit', url.searchParams.get('fit') || 'max');
	url.searchParams.set('w', String(width));
	url.searchParams.set('q', String(quality ?? 75));
	return url.href;
};

/**
 * GitHub sizes avatars with `?s=`. It serves the original format only, so
 * there is no `auto=format` equivalent here.
 */
const githubAvatarLoader: ImageLoader = ({ src, width }) => {
	const url = new URL(src);
	url.searchParams.set('s', String(width));
	return url.href;
};

/**
 * The loader is chosen per render rather than per call site because the sponsor
 * lists mix hosts: `sponsorOverrides` in `@/data/sponsors` swaps in imgix URLs
 * for a couple of sponsors while the rest stay on GitHub avatars, all inside
 * one `.map()`.
 *
 * The width param is stripped from the source URL for the same reason it is
 * overridden in the loaders: sponsor URLs arrive pre-sized — GitHub bakes
 * `?s=80` into `avatarUrl_80` and the imgix overrides carry `?w=80` — and a
 * pre-set width would otherwise survive into every srcset entry. It also keeps
 * Next from mistaking an unchanged URL for a loader that ignores width
 * (`next-image-missing-loader-width`).
 */
function resolveSrc(src: ImageProps['src']) {
	if (typeof src !== 'string') return { src };

	let url: URL;
	try {
		url = new URL(src);
	} catch {
		// Relative paths, static imports and `data:` URIs land here.
		return { src };
	}

	if (IMGIX_HOSTS.has(url.hostname)) {
		url.searchParams.delete('w');
		return { src: url.href, loader: imgixLoader };
	}

	if (url.hostname === GITHUB_AVATAR_HOST) {
		url.searchParams.delete('s');
		return { src: url.href, loader: githubAvatarLoader };
	}

	return { src };
}

/**
 * `next/image` pointed at whichever CDN already hosts the image, so the bytes
 * are resized by imgix or GitHub instead of being re-encoded a second time
 * through `/_next/image`.
 *
 * Anything from an unrecognized host falls through to Next's default loader,
 * which keeps its own conveniences — SVG and `data:` sources are served as-is
 * rather than proxied.
 *
 * `width`/`height` are required, but on a CSS-sized image they only set the
 * ratio and the widths the srcset is built from. They also become
 * presentational hints, which is why `_base.scss` gives every `img` a global
 * `height: auto` — without it a definite height hint survives and letterboxes
 * the image.
 */
export default function CdnImage({ alt, ...props }: ImageProps) {
	const { src, loader } = resolveSrc(props.src);

	return loader ? (
		<Image alt={alt} {...props} src={src} loader={loader} />
	) : (
		<Image alt={alt} {...props} src={src} />
	);
}
