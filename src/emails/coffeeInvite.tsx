import { Button, Text } from 'react-email';

import { Layout } from '@/lib/email/layout';
import { firstName } from '@/lib/email/name';
import type { EmailTemplate } from '@/lib/email/render';
import { styles } from '@/lib/email/styles';

export type CoffeeInviteProps = { name: string };

const TUESDAY = 'https://virtualcoffee.io/join-coffee?day=tuesday';
const THURSDAY = 'https://virtualcoffee.io/join-coffee?day=thursday';

export function subject(): string {
	return 'You’re invited to a Virtual Coffee';
}

export function Content({ name }: CoffeeInviteProps) {
	return (
		<>
			<Text style={styles.text}>Hi {firstName(name)},</Text>
			<Text style={styles.text}>
				Thanks for your patience on the waitlist. We&rsquo;d love to have you at
				a Coffee &mdash; that&rsquo;s a casual hour on Zoom with a handful of
				members, and it&rsquo;s the last step before joining the community.
			</Text>
			<Text style={styles.text}>Come to whichever suits you:</Text>
			<Text style={styles.text}>
				<Button href={TUESDAY} style={styles.button}>
					Tuesdays, 9:00am ET
				</Button>
			</Text>
			<Text style={styles.text}>
				<Button href={THURSDAY} style={styles.button}>
					Thursdays, 12:00pm ET
				</Button>
			</Text>
			<Text style={styles.text}>
				See you there,
				<br />
				Virtual Coffee
			</Text>
		</>
	);
}

export default function Email(props: CoffeeInviteProps) {
	return (
		<Layout preview="Come to a Coffee — the last step before joining.">
			<Content {...props} />
		</Layout>
	);
}

Email.PreviewProps = { name: 'Ada Lovelace' } satisfies CoffeeInviteProps;

export const coffeeInvite: EmailTemplate<CoffeeInviteProps> = {
	subject,
	Email,
	Content,
};
