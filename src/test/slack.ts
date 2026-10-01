import type { AnyBlock, KnownBlock } from '@slack/types';

import type { ContainerBlock, SlackMessage } from '@/lib/slack/blocks';

/**
 * Readers for a `SlackMessage`, so a test asserts on what a reviewer sees —
 * the fields and the buttons — rather than on the block tree that carries it.
 */

function isContainer(block: AnyBlock): block is ContainerBlock {
	return block.type === 'container';
}

/** The message's one container, or undefined for a message without one. */
export function container(message: SlackMessage): ContainerBlock | undefined {
	return message.blocks.find(isContainer);
}

/** Every block, containers flattened: the top level and every `child_blocks`. */
function allBlocks(message: SlackMessage): AnyBlock[] {
	return message.blocks.flatMap((block) =>
		isContainer(block) ? [block, ...block.child_blocks] : [block],
	);
}

/** `{ Name: 'Ada', Email: 'ada@example.test' }` from the `rich_text` fields, label without its colon. */
export function richTextFields(message: SlackMessage): Record<string, string> {
	const fields: Record<string, string> = {};
	for (const block of allBlocks(message)) {
		if (block.type !== 'rich_text') continue;
		for (const section of (block as Extract<KnownBlock, { type: 'rich_text' }>)
			.elements) {
			if (section.type !== 'rich_text_section') continue;
			const [label, value] = section.elements;
			if (label?.type === 'text' && value?.type === 'text') {
				fields[label.text.replace(/:\s*$/, '')] = value.text;
			}
		}
	}
	return fields;
}

/** `{ 'View in admin': 'https://…' }` from every `actions` block's link buttons, in order. */
export function buttonLinks(message: SlackMessage): Record<string, string> {
	const links: Record<string, string> = {};
	for (const block of allBlocks(message)) {
		if (block.type !== 'actions') continue;
		for (const element of (block as Extract<KnownBlock, { type: 'actions' }>)
			.elements) {
			if (element.type === 'button' && element.url) {
				links[element.text.text] = element.url;
			}
		}
	}
	return links;
}

/** The static mrkdwn notes (`context` blocks), top level and inside the container. */
export function notes(message: SlackMessage): string[] {
	return allBlocks(message).flatMap((block) =>
		block.type === 'context'
			? (block as Extract<KnownBlock, { type: 'context' }>).elements.flatMap(
					(element) => (element.type === 'mrkdwn' ? [element.text] : []),
				)
			: [],
	);
}
