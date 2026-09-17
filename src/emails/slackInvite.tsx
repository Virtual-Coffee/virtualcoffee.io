import { Button, Text } from 'react-email';

import { firstName } from '@/lib/email/name';
import { styles } from '@/lib/email/styles';
import { defineEmail } from '@/lib/email/template';

export type SlackInviteProps = { name: string; inviteUrl: string };

export function subject(): string {
	return 'Your Virtual Coffee Slack invite';
}

export function Content({ name, inviteUrl }: SlackInviteProps) {
	return (
		<>
			<Text style={styles.text}>Hi {firstName(name)},</Text>
			<Text style={styles.text}>
				Here&rsquo;s a fresh invite to the Virtual Coffee Slack &mdash; the
				earlier link no longer works:
			</Text>
			<Text style={styles.text}>
				<Button href={inviteUrl} style={styles.button}>
					Join the Slack
				</Button>
			</Text>
			<Text style={styles.text}>
				This link is for you and works once, so please don&rsquo;t forward it.
				If it&rsquo;s expired by the time you get to it, reply to this email and
				we&rsquo;ll send another.
			</Text>
			<Text style={styles.text}>
				See you in there,
				<br />~ Virtual Coffee Maintainer Team
			</Text>
		</>
	);
}

export const slackInvite = defineEmail<SlackInviteProps>({
	subject,
	preview: 'Your single-use link to the Virtual Coffee Slack.',
	Content,
	previewProps: {
		name: 'Ada Lovelace',
		inviteUrl: 'https://virtualcoffee.io/join-slack?code=example',
	},
});

export default slackInvite.Email;
