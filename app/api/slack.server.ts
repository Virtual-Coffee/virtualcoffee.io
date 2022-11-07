import { WebClient } from '@slack/web-api';
export { type UsersLookupByEmailResponse } from '@slack/web-api';

const SLACK_BOT_TOKEN =
	process.env.TEST_SLACK_BOT_TOKEN || process.env.SLACK_BOT_TOKEN;

const web = new WebClient(SLACK_BOT_TOKEN);

export async function lookUpByEmail(email: string) {
	return await web.users.lookupByEmail({ email });
}
