import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';

import TextContainer from './TextContainer';

describe('TextContainer', () => {
	test('renders its children, falling back to a white background and a Back to Top link', () => {
		const html = renderToStaticMarkup(<TextContainer>Body</TextContainer>);

		expect(html).toContain('Body');
		expect(html).toContain('class="bg-white py-3"');
		expect(html).toContain('<a href="#top">Back to Top</a>');
	});

	test('showBackToTopLink={false} omits the link', () => {
		const html = renderToStaticMarkup(
			<TextContainer showBackToTopLink={false}>Body</TextContainer>,
		);

		expect(html).not.toContain('Back to Top');
	});

	test('background is passed through', () => {
		const html = renderToStaticMarkup(
			<TextContainer background="light">Body</TextContainer>,
		);

		expect(html).toContain('class="bg-light py-3"');
	});
});
