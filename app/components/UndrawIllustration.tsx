import { aspectRatios, type SVGFiles } from '~/_generatedData/aspectRatios';

/**
 * The name of an Undraw illustration. (generated during build)
 */
export type UndrawIllustrationName = SVGFiles;

type UndrawIllustrationProps = {
	/** Filename of svg file found in [`public/assets/svg`](https://github.com/Virtual-Coffee/virtualcoffee.io/tree/main/public/assets/svg) */
	filename: UndrawIllustrationName;
	style?: React.CSSProperties;
} & React.ImgHTMLAttributes<HTMLImageElement>;

export default function UndrawIllustration({
	filename,
	style = {},
	...props
}: UndrawIllustrationProps): React.ReactElement<'img'> {
	const path = `/assets/svg/${filename}.svg`;
	const aspectRatio = aspectRatios[path];

	return (
		<img
			style={{ aspectRatio, ...style }}
			src={path}
			loading="lazy"
			aria-hidden="true"
			alt=""
			{...props}
		/>
	);
}
