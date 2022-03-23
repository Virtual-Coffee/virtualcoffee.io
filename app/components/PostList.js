import { Link } from 'remix';

export default function PostList({ items }) {
	if (!items) {
		return null;
	}
	return (
		<ul className="postlist">
			{items.map((item, key) => {
				return (
					<li className="postlist-item" key={key}>
						{item.url ? (
							<Link className="postlist-title" to={item.url}>
								{item.title}
							</Link>
						) : (
							item.title
						)}
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
				url: `/${item.slug}`,
				children: formatFileListItemsForPostList(item.children),
		  }))
		: null;
}
