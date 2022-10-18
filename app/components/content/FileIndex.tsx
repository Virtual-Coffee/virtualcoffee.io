import { useOutletContext } from '@remix-run/react';
import PostList, {
	FileListItem,
	formatFileListItemsForPostList,
} from '~/components/PostList';

type FileIndexProps = {
	subDirectory?: string;
};

function findBase(files: FileListItem[], subDirectory: string): FileListItem[] {
	const subDirectorySplit = subDirectory.split('/');

	const filtered = files.reduce((list, file) => {
		const slugSplit = file.slug.split('/');

		if (slugSplit.length < subDirectorySplit.length) {
			// we're still on a higher level directory, so we just need to drill down
			let matches = true;
			for (let i = 0; i < slugSplit.length; i++) {
				matches = slugSplit[i] === subDirectorySplit[i];
			}

			if (matches && file.children) {
				return findBase(file.children, subDirectory);
			}
		}

		if (
			slugSplit.length === subDirectorySplit.length &&
			subDirectory === file.slug
		) {
			// it's a match
			return [
				{
					...file,
					children: file.children
						? findBase(file.children, subDirectory)
						: null,
				} as FileListItem,
			];
		}

		// else we're digging deeper into our matched files children
		if (file.slug.startsWith(subDirectory)) {
			return [
				...list,
				{
					...file,
					children: file.children
						? findBase(file.children, subDirectory)
						: null,
				} as FileListItem,
			];
		}

		return list;
	}, [] as FileListItem[]);

	if (
		filtered.length === 1 &&
		filtered[0].slug === subDirectory &&
		filtered[0].children
	) {
		return filtered[0].children;
	}

	return filtered;
}

export default function FileIndex({ subDirectory }: FileIndexProps) {
	const allFiles = useOutletContext() as FileListItem[];

	const result = subDirectory ? findBase(allFiles, subDirectory) : allFiles;
	return <PostList items={formatFileListItemsForPostList(result)} />;
}
