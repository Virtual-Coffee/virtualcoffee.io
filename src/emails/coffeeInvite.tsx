import { Button, Link, Text } from 'react-email';

import { Layout } from '@/lib/email/layout';
import type { EmailTemplate } from '@/lib/email/render';
import { styles } from '@/lib/email/styles';
import { siteUrl } from '@/util/url.server';

/** Deliberately unaddressed: the maintainers' copy greets everyone alike. */
export type CoffeeInviteProps = Record<never, never>;

export function subject(): string {
	return 'You’re invited to a Virtual Coffee';
}

export function Content() {
	const tuesday = `${siteUrl()}/join-coffee?day=tuesday`;
	const thursday = `${siteUrl()}/join-coffee?day=thursday`;
	return (
		<>
			<Text style={styles.text}>Hello there! 👋</Text>
			<Text style={styles.text}>
				Thank you for your interest in Virtual Coffee. You are officially off
				the waiting list and can take the next steps to becoming a member!
			</Text>
			<Text style={styles.text}>
				The final step is to attend a Virtual Coffee meeting! After you&rsquo;ve
				attended a meeting, we&rsquo;ll send you an invite to our Slack channel,
				giving you access to Slack and all of our other member-only events.
			</Text>
			<Text style={styles.text}>
				Virtual Coffee meetings are one hour long and are held on Zoom twice per
				week:
			</Text>
			<Text style={styles.text}>
				<Button href={tuesday} style={styles.button}>
					Tuesdays at 9:00 AM Eastern
				</Button>
			</Text>
			<Text style={styles.text}>
				<Button href={thursday} style={styles.button}>
					Thursdays at 12:00 PM Eastern (Noon)
				</Button>
			</Text>
			<Text style={styles.text}>
				When you attend, please let your Notetaker know that this is your first
				Virtual Coffee! After the meeting, your Notetaker will let the
				Maintainers know that you&rsquo;ve attended, and you&rsquo;ll receive an
				email with additional instructions for joining Slack and becoming a full
				member!
			</Text>
			<Text style={styles.text}>
				Please direct any questions you have to{' '}
				<Link href="mailto:hello@virtualcoffee.io">hello@virtualcoffee.io</Link>
				.
			</Text>
			<Text style={styles.text}>
				<strong>Thanks, and we can&rsquo;t wait to meet you!</strong> ♥️
				<br />~ Virtual Coffee Maintainer Team
			</Text>
		</>
	);
}

export default function Email() {
	return (
		<Layout preview="You’re off the waiting list — the last step is a Virtual Coffee meeting.">
			<Content />
		</Layout>
	);
}

Email.PreviewProps = {} satisfies CoffeeInviteProps;

export const coffeeInvite: EmailTemplate<CoffeeInviteProps> = {
	subject,
	Email,
	Content,
};
