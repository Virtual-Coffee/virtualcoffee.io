import { Button, Text } from 'react-email';

import { firstName } from '@/lib/email/name';
import { styles } from '@/lib/email/styles';
import { defineEmail } from '@/lib/email/template';

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
				<br />~ Virtual Coffee Maintainer Team
			</Text>
		</>
	);
}

export const volunteerGrant = defineEmail<VolunteerGrantProps>({
	subject,
	preview: 'Anyone you invite skips the waitlist.',
	Content,
	previewProps: {
		name: 'Grace Hopper',
		balance: 1,
		invitesUrl: 'https://virtualcoffee.io/invites',
	},
});

export default volunteerGrant.Email;
