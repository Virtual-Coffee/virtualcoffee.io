import React from 'react';
import type { PolymorphicRef } from './types';
import type { MetaFunction } from '@remix-run/node';

export const metaFromData: MetaFunction = ({ data }) => {
	if (data.meta) {
		return data.meta;
	}

	return {};
};

/**
 * This is a hack, but basically we want to keep the full 'API' of the component, but we do want to
 * wrap it in a forwardRef so that we _can_ passthrough the ref
 */
export function forwardRefWithAs<
	P,
	T extends { name: string; displayName?: string },
>(
	component: T,
	defaultProps?: object,
): P & { displayName: string; defaultProps?: object } {
	return Object.assign(React.forwardRef(component as unknown as any) as any, {
		displayName: component.displayName ?? component.name,
		...(defaultProps ? { defaultProps: defaultProps } : {}),
	});
}

export function forwardRefFromComponent<
	TComponent extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
>(
	Component: TComponent,
	displayName?: string,
	defaultProps: Partial<React.ComponentProps<TComponent>> = {},
) {
	const render = <TTag2 extends React.ElementType>(
		props: React.ComponentProps<TComponent>,
		ref: React.Ref<TTag2>,
	) => {
		const merged: React.ComponentProps<TComponent> = {
			...props,
			...(ref
				? {
						passedRef: ref,
				  }
				: {}),
		};
		return <Component {...merged} />;
	};

	if (displayName) {
		render.displayName = displayName;
	}

	return forwardRefWithAs<typeof Component, typeof render>(
		render,
		defaultProps,
	) as <T extends React.ElementType>(
		p: React.ComponentProps<TComponent> & {
			ref?: PolymorphicRef<T>;
		},
	) => ReturnType<typeof render>;
}
