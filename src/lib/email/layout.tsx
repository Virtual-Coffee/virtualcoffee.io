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

import { siteUrl } from '@/util/url.server';

import { styles } from './styles';

/**
 * The wordmark is `src/svg/VirtualCoffeeFull.tsx` rasterised once to a PNG
 * (`rsvg-convert -w 480`): Gmail and Outlook render neither inline SVG nor
 * SVG images. The origin follows `siteUrl()`, same as every link in these
 * emails, so a local or preview send loads the logo from that env instead of
 * 404ing against production. `EMAIL_ASSET_ORIGIN` overrides it for
 * `pnpm email:dev`, which runs outside the Next app and serves the copy in
 * `src/emails/static/` itself. Read per-render, not cached at module load,
 * since `siteUrl()` reads the environment on every call.
 */
function wordmarkUrl(): string {
	const assetBase = process.env.EMAIL_ASSET_ORIGIN
		? `${process.env.EMAIL_ASSET_ORIGIN}/static`
		: `${siteUrl()}/assets/images/email`;
	return `${assetBase}/wordmark@2x.png`;
}

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
							src={wordmarkUrl()}
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
							<Link href={siteUrl()} style={styles.footerLink}>
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
