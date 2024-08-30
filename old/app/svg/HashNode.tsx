import type { IconProps } from 'members/types';

export default function HashNode({
	ariaHidden,
	title,
}: IconProps): JSX.Element {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			{...(ariaHidden
				? {
						'aria-hidden': 'true',
				  }
				: {
						role: 'img',
						'aria-labelledby': 'hashnodeSvgTitle',
				  })}
		>
			{!ariaHidden && (
				<title id="hashnodeSvgTitle">{title || 'HashNode'}</title>
			)}
			<path d="M22.351 8.019l-6.37-6.37a5.63 5.63 0 0 0-7.962 0l-6.37 6.37a5.63 5.63 0 0 0 0 7.962l6.37 6.37a5.63 5.63 0 0 0 7.962 0l6.37-6.37a5.63 5.63 0 0 0 0-7.962zM12 15.953a3.953 3.953 0 1 1 0-7.906 3.953 3.953 0 0 1 0 7.906z" />
		</svg>
	);
}
