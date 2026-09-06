/**
 * Email bodies. These are shown verbatim to the maintainer in the confirmation
 * dialog before anything is sent — the dialog renders the real text rather
 * than an "are you sure?", so what is written here is what a maintainer signs
 * off on.
 */

export type Template = { subject: string; text: string };

function firstName(name: string): string {
	return name.trim().split(/\s+/)[0] || 'there';
}

export function coffeeInviteEmail(name: string): Template {
	return {
		subject: 'You’re invited to a Virtual Coffee',
		text: `Hi ${firstName(name)},

Thanks for your patience on the waitlist. We'd love to have you at a Coffee — that's a casual hour on Zoom with a handful of members, and it's the last step before joining the community.

Come to whichever suits you:

  Tuesdays, 9:00am ET — https://virtualcoffee.io/join-coffee?day=tuesday
  Thursdays, 12:00pm ET — https://virtualcoffee.io/join-coffee?day=thursday

See you there,
Virtual Coffee`,
	};
}

export function welcomeEmail(name: string): Template {
	return {
		subject: 'Welcome to Virtual Coffee',
		text: `Hi ${firstName(name)},

It was good to have you at Coffee. You're a member — your Slack invite is on its way in a separate email, and the handbook is the best place to start:

  https://virtualcoffee.io/resources/virtual-coffee-handbook

Welcome in,
Virtual Coffee`,
	};
}

export function slackInviteEmail(name: string, inviteUrl: string): Template {
	return {
		subject: 'Your Virtual Coffee Slack invite',
		text: `Hi ${firstName(name)},

Here's your invite to the Virtual Coffee Slack:

  ${inviteUrl}

This link is for you and works once, so please don't forward it. If it's expired by the time you get to it, reply to this email and we'll send another.

See you in there,
Virtual Coffee`,
	};
}
