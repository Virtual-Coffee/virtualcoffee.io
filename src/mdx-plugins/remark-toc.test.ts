import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { describe, expect, test } from 'vitest';
import remarkToc from './remark-toc.mjs';

/**
 * Just enough of mdast (plus mdast-util-mdx-jsx's JSX nodes) for the
 * assertions, so the test does not need those packages' types installed.
 */
interface Node {
	type: string;
	name?: string;
	value?: string;
	attributes?: unknown[];
	children?: Node[];
}

const doc = [
	'# Title',
	'',
	'## Table of Contents',
	'',
	'## First section',
	'',
	'Some text.',
	'',
	'### A subsection',
	'',
	'## Second section',
].join('\n');

function parse(markdown: string): Node {
	return unified().use(remarkParse).parse(markdown) as Node;
}

function run(tree: Node, options?: Parameters<typeof remarkToc>[0]): Node {
	const processor = unified().use(remarkParse).use(remarkToc, options);
	return processor.runSync(tree as never) as Node;
}

const types = (node: Node) => node.children?.map((n) => n.type);

/** The link text of each item in a TOC list. */
const listItemTexts = (list: Node | undefined) =>
	list?.children?.map(
		(item) => item.children?.[0]?.children?.[0]?.children?.[0]?.value,
	);

describe('remarkToc', () => {
	test('replaces the Table of Contents heading with a wrapped heading and list', () => {
		const tree = run(parse(doc));

		// [title, wrapper, first section, text, subsection, second section]
		expect(types(tree)).toEqual([
			'heading',
			'mdxJsxFlowElement',
			'heading',
			'paragraph',
			'heading',
			'heading',
		]);

		const wrapper = tree.children![1];
		expect(wrapper.name).toBe('div');
		expect(wrapper.attributes).toEqual([
			{ type: 'mdxJsxAttribute', name: 'className', value: 'pt-5 bg-white' },
		]);

		const inner = wrapper.children![0];
		expect(inner.type).toBe('mdxJsxFlowElement');
		expect(inner.attributes).toEqual([
			{ type: 'mdxJsxAttribute', name: 'className', value: 'container prose' },
		]);
		expect(types(inner)).toEqual(['heading', 'list']);

		// The list covers the headings after the TOC, nested by depth.
		const list = inner.children![1];
		expect(listItemTexts(list)).toEqual(['First section', 'Second section']);
		expect(listItemTexts(list.children![0].children![1])).toEqual([
			'A subsection',
		]);
	});

	test('leaves a document with no such heading untouched', () => {
		const before = parse('# Title\n\n## Only section\n\nText.');
		const after = run(parse('# Title\n\n## Only section\n\nText.'));
		expect(after).toEqual(before);
	});

	test('accepts an alternative heading pattern', () => {
		const tree = run(parse('## Contents\n\n## A\n\n## B'), {
			heading: 'contents',
		});
		expect(types(tree)).toEqual(['mdxJsxFlowElement', 'heading', 'heading']);
	});

	test('reuses an existing JSX wrapper around the heading instead of adding one', () => {
		// MDX like `## Table of Contents\n<div className="x">…</div>` parses so
		// that the element directly after the heading is a JSX flow element;
		// the plugin then hoists the heading and list into it.
		const input = parse('## Table of Contents\n\n## A\n\n## B');
		input.children!.splice(1, 0, {
			type: 'mdxJsxFlowElement',
			name: 'aside',
			attributes: [],
			children: [],
		});

		const tree = run(input);

		expect(types(tree)).toEqual(['mdxJsxFlowElement', 'heading', 'heading']);
		const wrapper = tree.children![0];
		expect(wrapper.name).toBe('aside');
		expect(types(wrapper)).toEqual(['heading', 'list']);
	});
});
