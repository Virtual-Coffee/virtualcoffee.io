'use client';

import { BetterAuthDevtools } from 'better-auth-devtools/react';

export function DevtoolsPanel() {
	if (process.env.NODE_ENV === 'production') return null;
	return <BetterAuthDevtools />;
}
