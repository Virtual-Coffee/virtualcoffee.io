import { Button, Text } from 'react-email';

import { firstName } from '@/lib/email/name';
import { styles } from '@/lib/email/styles';
import { defineEmail } from '@/lib/email/template';
import { siteUrl } from '@/util/url.server';

export type WelcomeProps = { name: string; inviteUrl: string };

export function subject(): string {
	return 'Welcome to Virtual Coffee';
}

export function Content({ name, inviteUrl }: WelcomeProps) {
	const handbook = `${siteUrl()}/resources/virtual-coffee-handbook`;
	return (
		<>
			<Text style={styles.text}>Hi {firstName(name)},</Text>
			<Text style={styles.text}>
				It was good to have you at Coffee. You&rsquo;re a member &mdash; the
				handbook is the best place to start:
			</Text>
			<Text style={styles.text}>
				<Button href={handbook} style={styles.button}>
					Read the handbook
				</Button>
			</Text>
			<Text style={styles.text}>
				And here&rsquo;s your invite to the Virtual Coffee Slack:
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
				Welcome in,
				<br />~ Virtual Coffee Maintainer Team
			</Text>
		</>
	);
}

export const welcome = defineEmail<WelcomeProps>({
	subject,
	preview: 'You’re a member. The handbook and your Slack invite are inside.',
	Content,
	previewProps: {
		name: 'Ada Lovelace',
		inviteUrl: 'https://virtualcoffee.io/join-slack?code=example',
	},
});

export default welcome.Email;
