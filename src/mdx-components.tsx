import type { MDXComponents } from 'mdx/types';
import MdxLink from '@/components/content/MdxLink';

export function useMDXComponents(): MDXComponents {
	return { a: MdxLink };
}
