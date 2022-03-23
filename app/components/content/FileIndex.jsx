import { useOutletContext } from 'remix';
import PostList, { formatFileListItemsForPostList } from '../PostList';

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

export default function FileIndex({ subDirectory }) {
	const allFiles = useOutletContext();

	const result = subDirectory ? findBase(allFiles, subDirectory) : allFiles;
	return <PostList items={formatFileListItemsForPostList(result)} />;
}
