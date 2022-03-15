import { Link } from 'remix';

export default function PostList({ items }) {
	return (
		<ul className="postlist">
			{items.map((item) => {
				return (
					<li className="postlist-item" key={item.title}>
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
					</li>
				);
			})}
		</ul>
	);
}
