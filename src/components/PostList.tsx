import Link from 'next/link';

/*
PostListItem is each resource under a section of content on the homepage.
*/
type PostListItem = {
	/* To linking to another site, set the `href` property to the url. */
	href?: string;
	/* If linking to an internal page, use the `to` property. */
	to?: string;
	title: string;
	description?: string | JSX.Element;
	children?: PostListItem[] | null;
};

type TitleProps = {
	className: 'postlist-title';
} & Pick<PostListItem, 'href' | 'to'>;

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

export type FileListItem = {
	meta: {
		title: string;
		description: string;
	};
	slug: string;
	children?: FileListItem[];
};

export function formatFileListItemsForPostList(
	items?: FileListItem[],
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

	return items.map(
		(item): PostListItem => ({
			title: item.meta.title,
			description: item.meta.description,
			to: `/${item.slug}`,
			children: formatFileListItemsForPostList(
				item.children,
				depth,
				internalCurLevel + 1,
			),
		}),
	);
}
