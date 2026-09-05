import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { h as hastscript } from 'hastscript';
import { toString } from 'hast-util-to-string';

/**
 * Wraps rehype-autolink-headings with the site's anchor markup.
 *
 * The `content` and `group` options are functions, which cannot be passed
 * through next.config under Turbopack (loader options must be serializable),
 * so they are baked in here and the plugin is referenced by path string.
 *
 * @type {import('unified').Plugin<[], import('hast').Root>}
 */
export default function rehypeHeadingAnchors() {
	return rehypeAutolinkHeadings({
		behavior: 'after',
		properties: { class: 'header-anchor' },
		content: (node) => {
			return [
				hastscript('span.visually-hidden', `Permalink to “${toString(node)}”`),
				hastscript('span', { ariaHidden: 'true' }, '#'),
			];
		},
		group: (node) => {
			return hastscript(
				`.header-anchor-wrapper.header-anchor-wrapper-${node.tagName}`,
			);
		},
		test: ['h2', 'h3'],
	});
}
