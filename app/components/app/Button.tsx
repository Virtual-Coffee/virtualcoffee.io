import classNames from 'classnames';
import type { Argument } from 'classnames';
import type { PolymorphicComponentPropsWithRef } from '~/util/types';
import { forwardRefFromComponent } from '~/util/remixHelpers';

const colors = {
	primary: 'text-white bg-sky-600 hover:bg-sky-700 focus:ring-sky-500',
};

const sizes = {
	xs: 'px-2.5 py-1.5 text-xs font-medium rounded',
	sm: ' px-3 py-2  text-sm leading-4 font-medium rounded-md    ',
	md: ' px-4 py-2  text-sm font-medium rounded-md    ',
	lg: ' px-4 py-2  text-base font-medium rounded-md    ',
	xl: ' px-6 py-3  text-base font-medium rounded-md    ',
};

const base =
	'inline-flex items-center  border border-transparent shadow-sm  focus:outline-none focus:ring-2 focus:ring-offset-2';

export type ButtonProps<C extends React.ElementType> =
	PolymorphicComponentPropsWithRef<
		C,
		{
			size?: keyof typeof sizes;
			color?: keyof typeof colors;
		}
	>;

const ButtonComponent = <T extends React.ElementType = 'button'>({
	as,
	className,
	size = 'md',
	color = 'primary',
	children,
	...rest
}: ButtonProps<T>): React.ReactElement => {
	const Component = as || 'button';

	return (
		<Component
			className={classNames(base, sizes[size], colors[color], className)}
			{...rest}
		>
			{children}
		</Component>
	);
};

export let Button = forwardRefFromComponent(ButtonComponent, 'Button', {
	as: 'button',
});
