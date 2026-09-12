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

/**
 * The Claim Link a Volunteer sends. Names the Volunteer so the recipient
 * recognises it, but carries no free text of theirs: it goes out under
 * hello@virtualcoffee.io, and Reply-To stays there too.
 */
export function volunteerInviteEmail(
	inviterName: string,
	inviteeName: string,
	claimUrl: string,
): Template {
	return {
		subject: `${inviterName} invited you to Virtual Coffee`,
		text: `Hi ${firstName(inviteeName)},

${inviterName} thought you'd like Virtual Coffee, and used one of their invites on you. We're a deliberately small community of developers who meet for a casual hour on Zoom.

An invite skips the waitlist, so start here:

  ${claimUrl}

You'll be asked a few questions about yourself and to read our Code of Conduct. After that we'll invite you to a Coffee, and that's the last step before joining.

This link is for you and works once. If nothing happens for a few months it stops working, and ${inviterName} gets the invite back.

Hope to see you there,
Virtual Coffee`,
	};
}

/**
 * Sent once, when someone is made a Volunteer — most are pre-provisioned and
 * would otherwise first hear of /invites from a balance email.
 */
export function volunteerGrantEmail(
	name: string,
	balance: number,
	invitesUrl: string,
): Template {
	return {
		subject: 'You can now invite people to Virtual Coffee',
		text: `Hi ${firstName(name)},

Thanks for volunteering with Virtual Coffee. As one of our volunteers you can now invite people to join us directly, and anyone you invite skips the waitlist.

You have ${balance} invite${balance === 1 ? '' : 's'} to give out, and you'll get another on the 1st of each month:

  ${invitesUrl}

Sign in there with the same Slack account you use for Virtual Coffee.

Thank you,
Virtual Coffee`,
	};
}

/** The monthly nudge that a Volunteer has invites to give. */
export function volunteerAccrualEmail(
	name: string,
	balance: number,
	invitesUrl: string,
): Template {
	return {
		subject: `You have ${balance} Virtual Coffee invite${balance === 1 ? '' : 's'}`,
		text: `Hi ${firstName(name)},

You've got another invite to give out this month, which brings you to ${balance}.

Someone you invite skips the waitlist, so if there's a developer you've been meaning to bring in, this is the nudge:

  ${invitesUrl}

Thanks for everything you do here,
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
