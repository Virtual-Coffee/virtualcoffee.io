import { Link, json, useLoaderData } from 'remix';

export const loader = async () => {
	return json([
		{
			slug: 'my-first-post',
			title: 'My First Post',
		},
		{
			slug: '90s-mixtape',
			title: 'A Mixtape I Made Just For You',
		},
	]);
};

export default function Posts() {
	const posts = useLoaderData();
	console.log(posts);
	return (
		<main>
			<h1>Posts</h1>
			<ul>
				{posts.map((post) => (
					<li key={post.slug}>
						<Link to={post.slug}>{post.title}</Link>
					</li>
				))}
			</ul>
		</main>
	);
}
