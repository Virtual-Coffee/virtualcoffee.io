'use client';

import {
	BetterAuthDevtools,
	type BetterAuthDevtoolsProps,
} from 'better-auth-devtools/react';

/** Props come from `createDevtoolsPanelProps(devtoolsConfig)` in `testUserPanel.tsx`. */
export function DevtoolsPanel(props: BetterAuthDevtoolsProps) {
	if (process.env.NODE_ENV === 'production') return null;
	return <BetterAuthDevtools {...props} />;
}
