import { Button, Text } from 'react-email';

import { Layout } from '@/lib/email/layout';
import { firstName } from '@/lib/email/name';
import type { EmailTemplate } from '@/lib/email/render';
import { styles } from '@/lib/email/styles';

/**
 * The Claim Link a Volunteer sends. Names the Volunteer so the recipient
 * recognises it, but carries no free text of theirs: it goes out under
 * hello@virtualcoffee.io, and Reply-To stays there too.
 */
export type VolunteerInviteProps = {
	inviterName: string;
	inviteeName: string;
	claimUrl: string;
};

export function subject({ inviterName }: VolunteerInviteProps): string {
	return `${inviterName} invited you to Virtual Coffee`;
}

export function Content({
	inviterName,
	inviteeName,
	claimUrl,
}: VolunteerInviteProps) {
	return (
		<>
			<Text style={styles.text}>Hi {firstName(inviteeName)},</Text>
			<Text style={styles.text}>
				{inviterName} thought you&rsquo;d like Virtual Coffee, and used one of
				their invites on you. We&rsquo;re a deliberately small community of
				developers who meet for a casual hour on Zoom.
			</Text>
			<Text style={styles.text}>
				An invite skips the waitlist, so start here:
			</Text>
			<Text style={styles.text}>
				<Button href={claimUrl} style={styles.button}>
					Claim your invite
				</Button>
			</Text>
			<Text style={styles.text}>
				You&rsquo;ll be asked a few questions about yourself and to read our
				Code of Conduct. After that we&rsquo;ll invite you to a Coffee, and
				that&rsquo;s the last step before joining.
			</Text>
			<Text style={styles.text}>
				This link is for you and works once. If nothing happens for a few months
				it stops working, and {inviterName} gets the invite back.
			</Text>
			<Text style={styles.text}>
				Hope to see you there,
				<br />
				Virtual Coffee
			</Text>
		</>
	);
}

export default function Email(props: VolunteerInviteProps) {
	return (
		<Layout
			preview={`${props.inviterName} used an invite on you — it skips the waitlist.`}
		>
			<Content {...props} />
		</Layout>
	);
}

Email.PreviewProps = {
	inviterName: 'Grace Hopper',
	inviteeName: 'Ada Lovelace',
	claimUrl: 'https://virtualcoffee.io/join?invite=example',
} satisfies VolunteerInviteProps;

export const volunteerInvite: EmailTemplate<VolunteerInviteProps> = {
	subject,
	Email,
	Content,
};
