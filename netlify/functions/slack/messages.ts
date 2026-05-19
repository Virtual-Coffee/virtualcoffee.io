interface SlackUser {
	id: string;
	name: string;
}

interface TeamJoinEvent {
	user: SlackUser;
}

interface AppHomeOpenedEvent {
	user: string;
}

function getWelcomeBlocks(user?: SlackUser) {
	return [
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `:wave: Hey ${
					user ? `@${user.name}` : `there`
				}, welcome to Virtual Coffee -- fondly referred to as VC around this space.`,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ' ',
			},
		},
		{
			type: 'divider',
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ' ',
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ":heart: Before doing anything else, please first take a moment to read our <https://virtualcoffee.io/code-of-conduct|Code of Conduct>. Our Code of Conduct is in effect at any Virtual Coffee function, including direct messages. If you have experienced or witnessed violations to Virtual Coffee's Code of Conduct, please use our <https://virtualcoffee.io/report-coc-violation/|Code of Conduct Violation Form> to let us know.",
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ' ',
			},
		},
		{
			type: 'divider',
		},
		{
			type: 'header',
			text: {
				type: 'plain_text',
				text: 'Now for the fun part!',
				emoji: true,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: 'We have a lot going on here, but here are some places you might want to start:',
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `:white_check_mark: Head over to #welcome and introduce yourself to the rest of the group! Let us know what you like to do in your freetime, what you're doing in tech, and a random fact about your life!`,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ':dart: Check out #monthly-challenge to see what the community is working on together right now.',
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ':mega: The #announcements channel has the most recent news on events and initiatives happening in the community.',
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ":computer: Our #co-working-room is a zoom room that's open all day, every day for members to quietly work, pair on solving problems, or just say hello.",
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ':question: #help-and-pairing is the space for asking questions about any and all tech related topics. But if you have a general question, we have a really welcoming community, so feel free to throw it in the channel that looks best.',
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ' ',
			},
		},
		{
			type: 'divider',
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ' ',
			},
		},
		// Member ids (use ids in case username changes):
		// - Julia: U01JXQGMSUC
		// - Kirk: U01577R42TS
		// - Bekah: U014HT3RNCU
		// - Dan: U0157K5MUPJ
		// - Meg: U01B9NQF2PR
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ":heart: And remember, you can always message one of our community maintainers, <@U014HT3RNCU>, <@U0157K5MUPJ>, <@U01577R42TS>, <@U01JXQGMSUC>, or <@U01B9NQF2PR> for any help and support you may need. \n\n *We're happy to have you here!*",
			},
		},
	];
}

export function appHome({ event }: { event: AppHomeOpenedEvent }) {
	return {
		user_id: event.user,
		view: {
			type: 'home' as const,
			blocks: getWelcomeBlocks(),
		},
	};
}

export function welcome({ event }: { event: TeamJoinEvent }) {
	return {
		link_names: true,
		unfurl_links: false,
		unfurl_media: false,
		channel: event.user.id,
		text: `:wave: Hey @${event.user.name}, welcome to Virtual Coffee -- fondly referred to as VC around this space.`,
		blocks: getWelcomeBlocks(event.user),
	};
}
