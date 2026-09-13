import { Button, Text } from 'react-email';

import { Layout } from '@/lib/email/layout';
import { firstName } from '@/lib/email/name';
import type { EmailTemplate } from '@/lib/email/render';
import { styles } from '@/lib/email/styles';

/**
 * Sent once, when someone is made a Volunteer — most are pre-provisioned and
 * would otherwise first hear of /invites from a balance email.
 */
export type VolunteerGrantProps = {
	name: string;
	balance: number;
	invitesUrl: string;
};

export function subject(): string {
	return 'You can now invite people to Virtual Coffee';
}

export function Content({ name, balance, invitesUrl }: VolunteerGrantProps) {
	return (
		<>
			<Text style={styles.text}>Hi {firstName(name)},</Text>
			<Text style={styles.text}>
				Thanks for volunteering with Virtual Coffee. As one of our volunteers
				you can now invite people to join us directly, and anyone you invite
				skips the waitlist.
			</Text>
			<Text style={styles.text}>
				You have {balance} invite{balance === 1 ? '' : 's'} to give out, and
				you&rsquo;ll get another on the 1st of each month:
			</Text>
			<Text style={styles.text}>
				<Button href={invitesUrl} style={styles.button}>
					Your invites
				</Button>
			</Text>
			<Text style={styles.text}>
				Sign in there with the same Slack account you use for Virtual Coffee.
			</Text>
			<Text style={styles.text}>
				Thank you,
				<br />
				Virtual Coffee
			</Text>
		</>
	);
}

export default function Email(props: VolunteerGrantProps) {
	return (
		<Layout preview="Anyone you invite skips the waitlist.">
			<Content {...props} />
		</Layout>
	);
}

Email.PreviewProps = {
	name: 'Grace Hopper',
	balance: 1,
	invitesUrl: 'https://virtualcoffee.io/invites',
} satisfies VolunteerGrantProps;

export const volunteerGrant: EmailTemplate<VolunteerGrantProps> = {
	subject,
	Email,
	Content,
};
