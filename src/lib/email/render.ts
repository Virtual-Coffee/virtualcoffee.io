import { createElement, type ReactElement } from 'react';
import { render } from 'react-email';

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

export type RenderedEmail = { subject: string; html: string; text: string };

/**
 * Server only: `render` needs `react-dom/server`. The plain-text part is
 * derived from the same tree rather than kept by hand, so the two cannot
 * drift — a button comes out as `label url`, which is why the templates do
 * not also print the URL on its own line.
 */
export async function renderEmail<P extends object>(
	template: EmailTemplate<P>,
	props: P,
): Promise<RenderedEmail> {
	const element = createElement(template.Email, props);
	const [html, text] = await Promise.all([
		render(element),
		render(element, { plainText: true }),
	]);
	return { subject: template.subject(props), html, text };
}
