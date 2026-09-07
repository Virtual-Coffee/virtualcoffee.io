import Image, { type ImageProps } from 'next/image';
import { svgAspectRatios } from '@/data/undrawAspectRatios';

/**
 * The name of an Undraw illustration.
 */
export type UndrawIllustrationName = keyof typeof svgAspectRatios;

type UndrawIllustrationProps = {
	/** Filename of svg file found in [`public/assets/svg`](https://github.com/Virtual-Coffee/virtualcoffee.io/tree/main/public/assets/svg) */
	filename: UndrawIllustrationName;
	style?: React.CSSProperties;
} & Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'>;

export default function UndrawIllustration({
	filename,
	style = {},
	...props
}: UndrawIllustrationProps) {
	// Typed as possibly missing because `filename` is not always checked: MDX
	// frontmatter supplies it as a plain string via the `hero` field, and a few
	// pages name an illustration that has no SVG file.
	const aspectRatio: string | undefined = svgAspectRatios[filename];
	// `width`/`height` are required but only establish the ratio: these are
	// vector, and `next/image` serves SVG as-is rather than optimizing it.
	const [width, height] = aspectRatio?.split(' / ').map(Number) ?? [1, 1];

	return (
		<Image
			style={{ aspectRatio, ...style }}
			src={`/assets/svg/${filename}.svg`}
			width={width}
			height={height}
			loading="lazy"
			aria-hidden="true"
			alt=""
			{...props}
		/>
	);
}
