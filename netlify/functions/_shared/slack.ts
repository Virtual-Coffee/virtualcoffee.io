import { webApi } from '@slack/bolt';

const SLACK_BOT_TOKEN =
	process.env.TEST_SLACK_BOT_TOKEN || process.env.SLACK_BOT_TOKEN;

const web = new webApi.WebClient(SLACK_BOT_TOKEN);

export async function postMessage(message: webApi.ChatPostMessageArguments) {
	return web.chat.postMessage(message);
}

export async function updateMessage(message: webApi.ChatUpdateArguments) {
	return web.chat.update(message);
}

export async function publishView(message: webApi.ViewsPublishArguments) {
	return web.views.publish(message);
}
