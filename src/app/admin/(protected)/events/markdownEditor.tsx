'use client';

import '@mdxeditor/editor/style.css';

import {
	BoldItalicUnderlineToggles,
	CreateLink,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	ListsToggle,
	markdownShortcutPlugin,
	MDXEditor,
	toolbarPlugin,
	UndoRedo,
} from '@mdxeditor/editor';

/**
 * The description editor proper: rich text on screen, Markdown in the form.
 * Only `descriptionField.tsx` imports this, through `next/dynamic` with SSR
 * off — Lexical needs a DOM. The toolbar is the subset a description needs
 * and `/events` renders: bold, italic, lists, links.
 */
export default function MarkdownEditor({
	value,
	onChange,
	onError,
	disabled,
}: {
	value: string;
	onChange: (value: string) => void;
	/** The parser could not read `value`; the field falls back to a textarea. */
	onError: () => void;
	disabled: boolean;
}) {
	return (
		<MDXEditor
			markdown={value}
			onChange={(markdown, initialNormalize) => {
				// The editor's own normalisation of the loaded text (bullet
				// characters, whitespace) is not an edit the maintainer made.
				if (!initialNormalize) onChange(markdown);
			}}
			onError={onError}
			readOnly={disabled}
			className="admin-editor"
			contentEditableClassName="admin-editor__content"
			plugins={[
				listsPlugin(),
				linkPlugin(),
				linkDialogPlugin(),
				markdownShortcutPlugin(),
				toolbarPlugin({
					toolbarContents: () => (
						<>
							<UndoRedo />
							<BoldItalicUnderlineToggles options={['Bold', 'Italic']} />
							<ListsToggle options={['bullet', 'number']} />
							<CreateLink />
						</>
					),
				}),
			]}
		/>
	);
}
