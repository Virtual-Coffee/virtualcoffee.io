import type { ReactElement } from 'react';

import { Layout } from './layout';

/**
 * Client components render a template's `Content` in the confirmation dialogs,
 * so nothing server-only may be imported here — the renderer lives in
 * `render.ts`.
 */

/**
 * One template, three views of it. `Email` is the whole message — shell and
 * all — for sending and for the `pnpm email:dev` preview server. `Content`
 * is the part a maintainer signs off on in a confirmation dialog, rendered
 * there as the same React component that produces the sent HTML.
 */
export type EmailTemplate<P extends object> = {
	subject: (props: P) => string;
	Email: (props: P) => ReactElement;
	Content: (props: P) => ReactElement;
};

/**
 * Declares a template from its parts: `Email` is built here, once, as the
 * `Content` inside the shared `Layout`, so no template can ship a shell that
 * disagrees with the one every other message uses. `PreviewProps` rides on
 * `Email` because the `pnpm email:dev` server reads it off the file's default
 * export.
 */
export function defineEmail<P extends object>({
	subject,
	preview,
	Content,
	previewProps,
}: {
	subject: (props: P) => string;
	/** The preheader line the Layout shows; a function when it names the props. */
	preview: string | ((props: P) => string);
	Content: (props: P) => ReactElement;
	previewProps: P;
}): EmailTemplate<P> & {
	Email: ((props: P) => ReactElement) & { PreviewProps: P };
} {
	const Email = (props: P) => (
		<Layout preview={typeof preview === 'function' ? preview(props) : preview}>
			<Content {...props} />
		</Layout>
	);
	Email.PreviewProps = previewProps;
	return { subject, Email, Content };
}
