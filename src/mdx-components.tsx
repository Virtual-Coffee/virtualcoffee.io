import type { MDXComponents } from 'mdx/types';
import MdxLink from '@/components/content/MdxLink';

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		a: MdxLink,
		...components,
	};
}
