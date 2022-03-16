import { useOutletContext } from 'remix';
import PostList from '../PostList';

function findBase(files, subDirectory) {
	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		if (file.slug === subDirectory) {
			return file.children;
		} else if (
			file.slug.startsWith(subDirectory) &&
			file.children &&
			file.children.length
		) {
			return findBase(file.children, subDirectory);
		}
	}

	return files;
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

	console.log({ allFiles });

	const result = subDirectory ? findBase(allFiles, subDirectory) : allFiles;
	return <PostList items={formatPostListItems(result)} />;
}
