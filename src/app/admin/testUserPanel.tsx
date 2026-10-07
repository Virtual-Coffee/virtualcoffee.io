import { createDevtoolsPanelProps } from 'better-auth-devtools';

import { devtoolsConfig, devtoolsEnabled } from '@/lib/access/devtools';
import { DevtoolsPanel } from './devtoolsPanel';

/**
 * The devtools panel, mounted on /admin and on both sign-in pages. A server
 * component because the config holds the database writer; the client panel
 * only gets its props.
 */
export function TestUserPanel() {
	if (!devtoolsEnabled()) return null;
	return <DevtoolsPanel {...createDevtoolsPanelProps(devtoolsConfig)} />;
}

/** What the sign-in pages say, locally, where a deploy would warn that Slack isn't set up. */
export function LocalSignInHint() {
	return (
		<div className="alert alert-info" role="alert">
			<h2 className="h6 alert-heading">Sign in as a test user</h2>
			<p className="mb-0">
				Slack sign-in isn&rsquo;t configured. Run <code>pnpm db:seed</code>,
				then pick a test user from the Auth DevTools panel.
			</p>
		</div>
	);
}
