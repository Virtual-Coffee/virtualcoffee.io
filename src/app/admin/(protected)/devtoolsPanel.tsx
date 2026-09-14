'use client';

import {
	BetterAuthDevtools,
	type BetterAuthDevtoolsProps,
} from 'better-auth-devtools/react';

/** Props come from `createDevtoolsPanelProps(devtoolsConfig)` in the layout. */
export function DevtoolsPanel(props: BetterAuthDevtoolsProps) {
	if (process.env.NODE_ENV === 'production') return null;
	return <BetterAuthDevtools {...props} />;
}
