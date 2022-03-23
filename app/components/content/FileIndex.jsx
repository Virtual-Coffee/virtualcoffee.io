import { useOutletContext } from 'remix';
import PostList from '../PostList';

function findBase(files, subDirectory) {
	const filtered = files
		.filter((file) => file.slug.startsWith(subDirectory))
		.map((file) => ({
			...file,
			children: file.children ? findBase(file.children, subDirectory) : null,
		}));

	if (
		filtered.length === 1 &&
		filtered[0].slug === subDirectory &&
		filtered[0].children
	) {
		return filtered[0].children;
	}

	return filtered;
}

function formatPostListItems(items) {
	return items
		? items.map((item) => ({
				title: item.meta.title,
				description: item.meta.description,
				url: `/${item.slug}`,
				children: formatPostListItems(item.children),
		  }))
		: null;
}

export default function FileIndex({ subDirectory }) {
	const allFiles = useOutletContext();

	const result = subDirectory ? findBase(allFiles, subDirectory) : allFiles;
	return <PostList items={formatPostListItems(result)} />;
}
