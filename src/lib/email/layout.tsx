import {
	Body,
	Container,
	Head,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from 'react-email';
import type { ReactNode } from 'react';

import { styles } from './styles';

/**
 * The wordmark is `src/svg/VirtualCoffeeFull.tsx` rasterised once to a PNG
 * (`rsvg-convert -w 480`): Gmail and Outlook render neither inline SVG nor
 * SVG images. The URL is production's on purpose — an email outlives the
 * preview that sent it, and previews are captured anyway (docs/adr/0013).
 */
const WORDMARK_URL =
	'https://virtualcoffee.io/assets/images/email/wordmark@2x.png';

/**
 * The shell every message shares. Templates render their `Content` inside
 * it for sending; the confirmation dialogs render `Content` alone, so the
 * chrome here is never what a maintainer signs off on.
 */
export function Layout({
	preview,
	children,
}: {
	/** The inbox snippet, shown beside the subject. */
	preview: string;
	children: ReactNode;
}) {
	return (
		<Html lang="en">
			<Head />
			<Preview>{preview}</Preview>
			<Body style={styles.body}>
				<Container style={styles.container}>
					<Section style={styles.header}>
						<Img
							src={WORDMARK_URL}
							width="240"
							height="35"
							alt="Virtual Coffee"
							style={{ display: 'block' }}
						/>
					</Section>
					<Section style={styles.content}>{children}</Section>
					<Section style={styles.footer}>
						<Text style={{ margin: 0 }}>
							Virtual Coffee is a deliberately small developer community. Reply
							to this email to reach us, or visit{' '}
							<Link href="https://virtualcoffee.io" style={styles.footerLink}>
								virtualcoffee.io
							</Link>
							.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}
