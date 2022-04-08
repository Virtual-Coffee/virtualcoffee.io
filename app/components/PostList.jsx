import { Link } from 'remix';

export function PostListItemTitle({ item }) {
	let Component = 'div';
	const props = {
		className: 'postlist-title',
	};

	if (item.href) {
		Component = 'a';
		props.href = item.href;
	}

	if (item.to) {
		Component = Link;
		props.to = item.to;
	}

	return <Component {...props}>{item.title}</Component>;
}

export default function PostList({ items }) {
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

export function formatFileListItemsForPostList(items) {
	return items
		? items.map((item) => ({
				title: item.meta.title,
				description: item.meta.description,
				to: `/${item.slug}`,
				children: formatFileListItemsForPostList(item.children),
		  }))
		: null;
}
