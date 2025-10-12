import { MdxFile } from '@/util/loadMdx.server';
import Link from 'next/link';
import path from 'path';
import { ReactNode } from 'react';

/*
PostListItem is each resource under a section of content on the homepage.
*/
export type PostListItem = {
	href?: string;
	title: string;
	description?: string | ReactNode;
	children?: PostListItem[] | null;
	contentTags?: string[];
};

type TitleProps = {
	className: 'postlist-title';
} & Pick<PostListItem, 'href'>;

export function PostListItemTitle({ item }: { item: PostListItem }) {
	/* Component type changes based on whether a link exists */
	let Component: React.ElementType = 'div';
	const props: TitleProps = {
		className: 'postlist-title',
	};

	if (item.href) {
		Component = Link;
		props.href = item.href;
	}

	return <Component {...props}>{item.title}</Component>;
}

export default function PostList({ items }: { items: PostListItem[] | null }) {
	if (!items) {
		return null;
	}
	return (
		<ul className="postlist">
			{items.map((item, key) => {
				return (
					<li className="postlist-item" key={key}>
						<PostListItemTitle item={item} />
						{item.description && (
							<p className="postlist-description">{item.description}</p>
						)}
						{item.children && <PostList items={item.children} />}
					</li>
				);
			})}
		</ul>
	);
}

export function formatFileListItemsForPostList(
	items?: MdxFile[],
	depth?: number,
	curLevel?: number,
): PostListItem[] | null {
	const internalCurLevel: number =
		typeof curLevel === 'undefined' ? (curLevel = 0) : curLevel;

	if (typeof depth === 'undefined') {
		depth = Infinity;
	}

	if (!items || internalCurLevel >= depth) {
		return null;
	}
	return items.map((item): PostListItem => {
		const parts = item.slug.split(path.sep).filter((part) => {
			return !!part && part !== 'content';
		});


		return {
			title: item.meta.title,
			description: item.meta.description,
			href: `/${parts.join('/')}`,
			contentTags: item.contentTags || [],
			children: formatFileListItemsForPostList(
				item.children,
				depth,
				internalCurLevel + 1,
			),
		};
	});
}
