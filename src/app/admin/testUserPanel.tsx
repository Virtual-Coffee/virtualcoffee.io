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

/**
 * What both sign-in pages show in place of the Slack button when
 * `slackAuthConfigured` is false: locally, the way in through the panel; on a
 * deploy, a misconfiguration warning.
 */
export function SlackNotConfigured() {
	if (devtoolsEnabled()) {
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

	return (
		<div className="alert alert-warning" role="alert">
			<h2 className="h6 alert-heading">Slack sign-in isn&rsquo;t configured</h2>
			<p className="mb-0">
				<code>SLACK_CLIENT_ID</code>, <code>SLACK_CLIENT_SECRET</code> and{' '}
				<code>SLACK_TEAM_ID</code> are not all set, so there&rsquo;s nothing to
				sign in to.
			</p>
		</div>
	);
}
