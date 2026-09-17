import { createElement } from 'react';
import { render } from 'react-email';

import type { EmailTemplate } from './template';

export type { EmailTemplate } from './template';

export type RenderedEmail = { subject: string; html: string; text: string };

/**
 * Server only: `render` needs `react-dom/server`, which is why the template
 * declaration a client component reaches lives in `template.tsx` instead. The
 * plain-text part is derived from the same tree rather than kept by hand, so
 * the two cannot drift — a button comes out as `label url`, which is why the
 * templates do not also print the URL on its own line.
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
