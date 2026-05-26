import querystring from 'node:querystring';
import { App } from '@slack/bolt';
import type { Receiver, ReceiverEvent } from '@slack/bolt';
import { verifySlackRequest } from '../_shared/verify';
import { requireEnv } from '../_shared/env';
import * as messages from './messages';

const SLACK_BOT_TOKEN =
	process.env.TEST_SLACK_BOT_TOKEN || requireEnv('SLACK_BOT_TOKEN');
const SLACK_SIGNING_SECRET =
	process.env.TEST_SLACK_SIGNING_SECRET || requireEnv('SLACK_SIGNING_SECRET');

/**
 * Custom Bolt receiver for Netlify Functions.
 * Handles signature verification, body parsing (JSON + form-encoded),
 * url_verification challenges, and ReceiverEvent construction.
 */
class NetlifyReceiver implements Receiver {
	private app?: App;
	private signingSecret: string;

	constructor(signingSecret: string) {
		this.signingSecret = signingSecret;
	}

	init(app: App) {
		this.app = app;
	}

	start() {
		return Promise.resolve();
	}

	stop() {
		return Promise.resolve();
	}

	async handleRequest(req: Request): Promise<Response> {
		const rawBody = await req.text();
		const contentType = req.headers.get('content-type') ?? '';
		const body = this.parseBody(rawBody, contentType);

		// Slack sends this once when configuring the Events API URL
		if (body.type === 'url_verification') {
			return new Response(JSON.stringify({ challenge: body.challenge }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const isValid = verifySlackRequest(
			rawBody,
			req.headers,
			this.signingSecret,
		);
		if (!isValid.valid) {
			console.log('Failed validation:', isValid.reason);
			return new Response(isValid.reason, { status: 401 });
		}

		let storedResponse: string | undefined;

		const event: ReceiverEvent = {
			body,
			ack: async (response) => {
				if (typeof response === 'undefined' || response == null) {
					storedResponse = '';
				} else if (typeof response === 'string') {
					storedResponse = response;
				} else {
					storedResponse = JSON.stringify(response);
				}
			},
			retryNum: req.headers.get('x-slack-retry-num')
				? Number(req.headers.get('x-slack-retry-num'))
				: undefined,
			retryReason: req.headers.get('x-slack-retry-reason') ?? undefined,
		};

		try {
			await this.app!.processEvent(event);

			if (storedResponse !== undefined) {
				return new Response(storedResponse, {
					status: 200,
					headers: storedResponse
						? { 'Content-Type': 'application/json' }
						: undefined,
				});
			}
		} catch (error) {
			console.error('Error processing Slack event:', error);
			return new Response('Internal server error', { status: 500 });
		}

		return new Response('', { status: 404 });
	}

	private parseBody(
		rawBody: string,
		contentType: string,
	): Record<string, unknown> {
		if (contentType.includes('application/x-www-form-urlencoded')) {
			const parsed = querystring.parse(rawBody);
			if (typeof parsed.payload === 'string') {
				return JSON.parse(parsed.payload);
			}
			return parsed;
		}
		return JSON.parse(rawBody);
	}
}

const receiver = new NetlifyReceiver(SLACK_SIGNING_SECRET);

const app = new App({
	token: SLACK_BOT_TOKEN,
	receiver,
	processBeforeResponse: true,
});

app.event('team_join', async ({ event, client }) => {
	const msg = messages.welcome({ event });
	await client.chat.postMessage(msg);
});

app.event('app_home_opened', async ({ event, client }) => {
	const view = messages.appHome({ event });
	await client.views.publish(view);
});

export default async (req: Request) => receiver.handleRequest(req);
