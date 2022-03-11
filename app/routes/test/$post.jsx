import { json, useLoaderData } from 'remix';

export const loader = async ({ params }) => {
	return json(params.post);
};

export default function PostSlug() {
	const slug = useLoaderData();
	return (
		<main
			style={{
				padding: '48px',
				paddingBottom: '0',
			}}
		>
			<h1>Some Post: {slug}</h1>
		</main>
	);
}
