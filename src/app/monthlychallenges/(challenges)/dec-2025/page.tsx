import Link from 'next/link';
import LeadText from '@/components/content/LeadText';

const handle = {
	listTitle: 'December 2025: Share Your Tradition',
	meta: {
		title: 'Monthly Challenge for December 2025: Share Your Tradition',
		description:
			"December challenge -> Let's celebrate the diverse cultures and traditions within our community.",
	},
	date: '2025-12-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<h1>
				<small>Monthly Challenge for December 2025:</small> Share Your Tradition
			</h1>

			<p className="lead text-center mt-3">
				Let's celebrate the diverse cultures and traditions within our community.
			</p>

			<h2 className="mt-5 mb-3">The Challenge</h2>
			<p>
				December is often a time of reflection and celebration for many, marked by diverse holidays. However, this challenge is not limited to winter or current-month festivities. We want to hear about <strong>any tradition</strong> that holds meaning for you, whether it's tied to a season, a birthday, a summer vacation, or an everyday household custom.
			</p>
			<p>
				This challenge is a month-long celebration of storytelling, reflection, and connection. It's your chance to share photos, recipes, and personal stories of how you and your loved ones celebrate life's moments. Our goal is to engage our community, help us all learn more about each other, and provide built-in support for anyone who might find themselves alone during the holidays. Let's make this an engaging, asynchronous experience where you can share your traditions in the way that feels most interesting and fun for you.
			</p>

			<h2 className="mb-3">How to Participate</h2>
			<p>You can share your traditions by starting a new thread or replying to an existing one in the <code>#monthly-challenge</code> channel.</p>

			<h3 className="mb-3">Start the Conversation</h3>
			<p>Kick off your sharing by answering this prompt as the first message in your new thread:</p>
			<LeadText>
				<p>"Share one tradition (any season, any time of year) and tell us what makes it meaningful to you."</p>
			</LeadText>

			<h4 className="my-4">Thread Ideas to Inspire You</h4>
			<ul>
				<li className="mb-3"><strong>🍽️ Food & Recipes:</strong> Share a recipe, dish, or food tradition you love (a photo is a bonus!).</li>
				<li className="mb-3"><strong>🎵 Music & Playlists:</strong> Share music, songs, or playlists that are part of your tradition.</li>
				<li className="mb-3"><strong>📚 Tradition-in-a-Book:</strong> Share a book, poem, or story connected to a tradition.</li>
				<li className="mb-3"><strong>🐾 Pet Traditions:</strong> Do your pets celebrate with you? Share their customs!</li>
				<li className="mb-3"><strong>🔨 Tradition-Inspired Crafts or DIY:</strong> Share photos or steps for a craft you make for a tradition.</li>
				<li className="mb-3"><strong>💡 Lights & Lanterns:</strong> Share photos of beautiful light displays, night light traditions, or cultural lanterns.</li>
				<li className="mb-3"><strong>🏡 Places & Decorations:</strong> Share a photo of a place, decoration, or display connected to a tradition important to you or your family.</li>
				<li className="mb-3"><strong>🤣 Traditions That Make You Laugh:</strong> share a funny, quirky, or unexpected tradition.</li>
				<li className="mb-3"><strong>👨‍👩‍👧‍👦 Family & Community:</strong> Share a story about a tradition that brings people together.</li>
				<li className="mb-3"><strong>⏩ Passing It On:</strong> What tradition are you currently passing on to others?</li>
				<li className="mb-3"><strong>🆕 Invented Traditions:</strong> What's a unique tradition you've invented for yourself or your family?</li>
				<li className="mb-3"><strong>🌱 New Traditions:</strong> What tradition did you start as an adult, or one you want to begin?</li>
				<li className="mb-3"><strong>🗑️ Retired Traditions:</strong> What's a tradition you stopped doing (and why)?</li>
			</ul>

			<h3 className="mb-3">Lunch and Learns</h3>
			<p>Do you have a hands-on tradition you'd like to share, such as baking a special dish, demonstrating a cultural craft, or sharing the history behind a custom? We encourage you to share it through a <Link href="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/lunch-and-learns">Lunch and Learns</Link>!</p>
			<p>You can submit it on our <Link href="/lunch-and-learn-idea">Lunch & Learns Idea Form</Link>.</p>

			<h3 className="mb-3">Explore Related Channels</h3>
			<p>If you have specific cultural or language content you'd like to share, you may also be interested in checking out and posting in:</p>
			<ul>
				<li><code>#foreign-languages-and-culture</code></li>
				<li><code>#food</code></li>
				<li><code>#making-stuff</code></li>
				<li><code>#entertainment</code></li>
				<li><code>#i-love-animals</code></li>
			</ul>

			<hr />

			<p>You can reach out to the maintainers or monthly challenge facilitators if you have any questions. Remember, we're always here to help. ❤️</p>
		</>
	);
}
