/**
 * Inline styles for the email templates. Email clients need CSS inline and
 * ignore most of it anyway, so this is deliberately a handful of tokens, not
 * the site's stylesheet. Colours are the Bootstrap overrides in
 * `src/styles/_variables.scss` — `$pink` and `$pinkDarker` — written out as
 * literals because nothing here goes through Sass.
 */

export const colors = {
	primary: '#d9376e',
	primaryDark: '#7e0029',
	text: '#212529',
	muted: '#6c757d',
	background: '#f4f4f5',
	surface: '#ffffff',
	border: '#dee2e6',
} as const;

export const fontFamily =
	"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const styles = {
	body: {
		backgroundColor: colors.background,
		fontFamily,
		margin: 0,
		padding: '24px 0',
	},
	container: {
		backgroundColor: colors.surface,
		border: `1px solid ${colors.border}`,
		borderRadius: '8px',
		maxWidth: '560px',
		margin: '0 auto',
		overflow: 'hidden',
	},
	header: {
		backgroundColor: colors.primary,
		padding: '20px 32px',
	},
	content: {
		padding: '8px 32px 24px',
	},
	text: {
		color: colors.text,
		fontSize: '16px',
		lineHeight: '24px',
		margin: '16px 0',
	},
	button: {
		backgroundColor: colors.primary,
		borderRadius: '6px',
		color: colors.surface,
		display: 'inline-block',
		fontSize: '16px',
		fontWeight: 600,
		padding: '12px 20px',
		textDecoration: 'none',
	},
	footer: {
		borderTop: `1px solid ${colors.border}`,
		color: colors.muted,
		fontSize: '13px',
		lineHeight: '20px',
		padding: '16px 32px',
	},
	footerLink: {
		color: colors.muted,
		textDecoration: 'underline',
	},
} as const;
