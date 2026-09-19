/**
 * Block Kit shapes shared by the channel posts (`notify.ts`) and the DMs
 * (`dm.ts`). Anything a person typed goes into a `rich_text` run or a
 * `plain_text` object, both of which Slack renders literally; mrkdwn is for
 * static copy only, which is why nothing here escapes. docs/adr/0016.
 */

import type {
	ActionsBlock,
	AnyBlock,
	Block,
	ContextBlock,
	KnownBlock,
	PlainTextElement,
	RichTextBlock,
	RichTextSection,
} from '@slack/types';

/** What a sender posts: the blocks, and the one-line `text` notifications show. */
export type SlackMessage = {
	text: string;
	blocks: AnyBlock[];
};

/** Not in `@slack/types@3.1` yet; the fields are the container block reference's. */
export interface ContainerBlock extends Block {
	type: 'container';
	title: PlainTextElement;
	subtitle?: PlainTextElement;
	is_collapsible?: boolean;
	default_collapsed?: boolean;
	/** At most 10; `card`, `markdown` and `data_table` cannot be children. */
	child_blocks: KnownBlock[];
}

/** `plain_text` titles and subtitles cap at 150 characters. */
export const PLAIN_TEXT_MAX = 150;

export function clip(value: string, max = PLAIN_TEXT_MAX): string {
	const trimmed = value.trim();
	return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}

function plainText(text: string): PlainTextElement {
	return { type: 'plain_text', text: clip(text) };
}

export type Field = [label: string, value: string | null | undefined];

/** One paragraph per field: a bold label run, then the value as a literal run; a dash for nothing. */
export function fields(pairs: Field[]): RichTextBlock {
	return {
		type: 'rich_text',
		elements: pairs.map(([label, value]): RichTextSection => ({
			type: 'rich_text_section',
			elements: [
				{ type: 'text', text: `${label}: `, style: { bold: true } },
				{ type: 'text', text: value?.trim() || '—' },
			],
		})),
	};
}

export type LinkButton = { url: string; label: string; primary?: boolean };

/** Link buttons in array order; the first is usually the primary one. */
export function buttons(...links: LinkButton[]): ActionsBlock {
	return {
		type: 'actions',
		elements: links.map(({ url, label, primary }) => ({
			type: 'button',
			text: { type: 'plain_text', text: label },
			url,
			...(primary ? { style: 'primary' as const } : {}),
		})),
	};
}

/** Static copy in mrkdwn. Never a value a person typed: mrkdwn reads `<!channel>`. */
export function note(mrkdwn: string): ContextBlock {
	return { type: 'context', elements: [{ type: 'mrkdwn', text: mrkdwn }] };
}

/**
 * One notification is one container: the row's fields, an optional note, and
 * where to open it. `collapsed` is for a post whose fields should not sit open
 * in the channel for anyone scrolling past.
 */
export function notification(post: {
	title: string;
	subtitle?: string | null;
	collapsed?: boolean;
	fields: Field[];
	note?: string | null;
	buttons: LinkButton[];
}): ContainerBlock {
	const subtitle = post.subtitle?.trim();
	return {
		type: 'container',
		title: plainText(post.title),
		...(subtitle ? { subtitle: plainText(subtitle) } : {}),
		is_collapsible: true,
		...(post.collapsed ? { default_collapsed: true } : {}),
		child_blocks: [
			fields(post.fields),
			...(post.note ? [note(post.note)] : []),
			buttons(...post.buttons),
		],
	};
}
