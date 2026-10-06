import { unified } from 'unified';
import { describe, expect, test } from 'vitest';
import remarkUnwrapJsxParagraph from './remark-unwrap-jsx-paragraph.mjs';

/** Just enough of mdast and mdast-util-mdx-jsx's JSX nodes for the tests. */
interface Node {
	type: string;
	name?: string;
	value?: string;
	children?: Node[];
}

const text = (value: string): Node => ({ type: 'text', value });
const paragraph = (...children: Node[]): Node => ({
	type: 'paragraph',
	children,
});
const jsx = (name: string, ...children: Node[]): Node => ({
	type: 'mdxJsxFlowElement',
	name,
	children,
});

function run(...children: Node[]): Node {
	const tree: Node = { type: 'root', children };
	return unified()
		.use(remarkUnwrapJsxParagraph)
		.runSync(tree as never) as Node;
}

describe('remarkUnwrapJsxParagraph', () => {
	test.each(['h3', 'p', 'a', 'Link'])(
		'unwraps the lone paragraph inside <%s>',
		(name) => {
			expect(run(jsx(name, paragraph(text('Add Your Entry!'))))).toEqual({
				type: 'root',
				children: [jsx(name, text('Add Your Entry!'))],
			});
		},
	);

	test('unwraps nested elements, as in <p><a>…</a></p>', () => {
		expect(run(jsx('p', jsx('a', paragraph(text('Go')))))).toEqual({
			type: 'root',
			children: [jsx('p', jsx('a', text('Go')))],
		});
	});

	test('leaves flow containers and multi-paragraph content alone', () => {
		const div = jsx('div', paragraph(text('Alert')));
		const twoParagraphs = jsx(
			'p',
			paragraph(text('One')),
			paragraph(text('Two')),
		);

		expect(run(div, twoParagraphs)).toEqual({
			type: 'root',
			children: [div, twoParagraphs],
		});
	});
});
