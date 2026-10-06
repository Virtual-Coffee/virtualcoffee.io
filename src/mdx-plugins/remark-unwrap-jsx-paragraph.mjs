/**
 * Elements whose content model is phrasing only: a `<p>` inside one is invalid
 * HTML, which the browser repairs by splitting the element.
 */
const PHRASING_ONLY = new Set([
	'p',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'a',
	'span',
	'small',
	'strong',
	'em',
	'b',
	'i',
	'q',
	'code',
	'label',
	'button',
	// next/link renders an `<a>`.
	'Link',
]);

/**
 * Remark plugin: when JSX like `<h3 className="mb-3">` has its text on its
 * own lines, MDX parses that text as a paragraph, rendering `<h3><p>…</p></h3>`.
 * Prettier wraps long JSX that way, so this unwraps the lone paragraph inside
 * any phrasing-only element instead of relying on how a file is formatted.
 *
 * @type {import('unified').Plugin<[], import('mdast').Root>}
 */
export default function remarkUnwrapJsxParagraph() {
	return (tree) => {
		walk(tree);
	};
}

function walk(node) {
	if (
		node.type === 'mdxJsxFlowElement' &&
		PHRASING_ONLY.has(node.name) &&
		node.children.length === 1 &&
		node.children[0].type === 'paragraph'
	) {
		node.children = node.children[0].children;
	}
	for (const child of node.children ?? []) {
		walk(child);
	}
}
