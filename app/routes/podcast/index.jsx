import { useLoaderData, Link } from 'remix';
import { loadMdx } from '~/util/loadMdx.server.js';

export const loader = () => {
	const episodes = loadMdx();

	return episodes;
};

export default function PodcastsIndex() {
	const episodes = useLoaderData();
	console.log(episodes);

	return <div>hello!</div>;
}
