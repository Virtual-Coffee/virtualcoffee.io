import classNames from 'classnames';
import type { Argument } from 'classnames';
import type { PolymorphicComponentPropsWithRef } from '~/util/types';
import { forwardRefFromComponent } from '~/util/remixHelpers';

const colors = {
	primary: 'text-white bg-sky-600 hover:bg-sky-700 focus:ring-sky-500',
	white:
		'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-sky-500',
	black:
		'border-transparent bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-900',
};

const sizes = {
	xs: 'px-2.5 py-1.5 text-xs font-medium rounded',
	sm: ' px-3 py-2  text-sm leading-4 font-medium rounded-md    ',
	md: ' px-4 py-2  text-sm font-medium rounded-md    ',
	lg: ' px-4 py-2  text-base font-medium rounded-md    ',
	xl: ' px-6 py-3  text-base font-medium rounded-md    ',
};

const base =
	'inline-flex justify-center items-center border border-transparent shadow-sm  focus:outline-none focus:ring-2 focus:ring-offset-2';

export type ButtonProps<C extends React.ElementType> =
	PolymorphicComponentPropsWithRef<
		C,
		{
			size?: keyof typeof sizes;
			color?: keyof typeof colors;
			fullWidth?: boolean;
		}
	>;

const ButtonComponent = <T extends React.ElementType = 'button'>({
	as,
	className,
	size = 'md',
	color = 'primary',
	fullWidth,
	children,
	passedRef,
	...rest
}: ButtonProps<T>): React.ReactElement => {
	const Component = as || 'button';

	return (
		<Component
			className={classNames(
				base,
				sizes[size],
				colors[color],
				fullWidth && 'w-full',
				className,
			)}
			ref={passedRef}
			{...rest}
		>
			{children}
		</Component>
	);
};

export let Button = forwardRefFromComponent(ButtonComponent, 'Button', {
	as: 'button',
});
