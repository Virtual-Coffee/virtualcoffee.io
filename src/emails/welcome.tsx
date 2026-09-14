import { Button, Text } from 'react-email';

import { Layout } from '@/lib/email/layout';
import { firstName } from '@/lib/email/name';
import type { EmailTemplate } from '@/lib/email/render';
import { styles } from '@/lib/email/styles';
import { siteUrl } from '@/util/url.server';

export type WelcomeProps = { name: string };

export function subject(): string {
	return 'Welcome to Virtual Coffee';
}

export function Content({ name }: WelcomeProps) {
	const handbook = `${siteUrl()}/resources/virtual-coffee-handbook`;
	return (
		<>
			<Text style={styles.text}>Hi {firstName(name)},</Text>
			<Text style={styles.text}>
				It was good to have you at Coffee. You&rsquo;re a member &mdash; your
				Slack invite is on its way in a separate email, and the handbook is the
				best place to start:
			</Text>
			<Text style={styles.text}>
				<Button href={handbook} style={styles.button}>
					Read the handbook
				</Button>
			</Text>
			<Text style={styles.text}>
				Welcome in,
				<br />~ Virtual Coffee Maintainer Team
			</Text>
		</>
	);
}

export default function Email(props: WelcomeProps) {
	return (
		<Layout preview="You’re a member. Your Slack invite is on its way.">
			<Content {...props} />
		</Layout>
	);
}

Email.PreviewProps = { name: 'Ada Lovelace' } satisfies WelcomeProps;

export const welcome: EmailTemplate<WelcomeProps> = { subject, Email, Content };
