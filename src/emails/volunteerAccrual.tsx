import { Button, Text } from 'react-email';

import { Layout } from '@/lib/email/layout';
import { firstName } from '@/lib/email/name';
import type { EmailTemplate } from '@/lib/email/render';
import { styles } from '@/lib/email/styles';

/** The monthly nudge that a Volunteer has invites to give. */
export type VolunteerAccrualProps = {
	name: string;
	balance: number;
	invitesUrl: string;
};

export function subject({ balance }: VolunteerAccrualProps): string {
	return `You have ${balance} Virtual Coffee invite${balance === 1 ? '' : 's'}`;
}

export function Content({ name, balance, invitesUrl }: VolunteerAccrualProps) {
	return (
		<>
			<Text style={styles.text}>Hi {firstName(name)},</Text>
			<Text style={styles.text}>
				You&rsquo;ve got another invite to give out this month, which brings you
				to {balance}.
			</Text>
			<Text style={styles.text}>
				Someone you invite skips the waitlist, so if there&rsquo;s a developer
				you&rsquo;ve been meaning to bring in, this is the nudge:
			</Text>
			<Text style={styles.text}>
				<Button href={invitesUrl} style={styles.button}>
					Send an invite
				</Button>
			</Text>
			<Text style={styles.text}>
				Thanks for everything you do here,
				<br />~ Virtual Coffee Maintainer Team
			</Text>
		</>
	);
}

export default function Email(props: VolunteerAccrualProps) {
	return (
		<Layout preview="Another invite to give out this month.">
			<Content {...props} />
		</Layout>
	);
}

Email.PreviewProps = {
	name: 'Grace Hopper',
	balance: 3,
	invitesUrl: 'https://virtualcoffee.io/invites',
} satisfies VolunteerAccrualProps;

export const volunteerAccrual: EmailTemplate<VolunteerAccrualProps> = {
	subject,
	Email,
	Content,
};
