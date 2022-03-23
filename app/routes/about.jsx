import { json, useLoaderData } from 'remix';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import DisplayHtml from '~/components/DisplayHtml';
import { getEvents } from '~/data/events';
import { dateForDisplay } from '~/util/date';

export const handle = {
	meta: {
		title: 'About Virtual Coffee',
		description:
			'All about Virtual Coffee: Our Mission, Core Values, History, and more.',
	},
};
export const meta = () => handle.meta;

// ---
// layout: layouts/simple.njk
// title: About Virtual Coffee
// description: 'All about Virtual Coffee: Our Mission, Core Values, History, and more.'
// tags:
//   - topnav
// homePageBlocks:
//   type: small
//   key: About Virtual Coffee
//   order: 1
// hero: 'svg/undraw_dreamer_gxxi.svg'
// heroHeader: 'About Virtual Coffee'
// eleventyNavigation:
//   key: About
//   order: 1
// ---

export default function EventsIndex() {
	return (
		<DefaultLayout simple Hero="UndrawDreamer">
			<div className="header-anchor-wrapper header-anchor-wrapper-h2">
				<h2 id="who-we-are" tabindex="-1">
					Who we are
				</h2>
				<a className="header-anchor" href="#who-we-are">
					<span className="sr-only">Permalink to “Who we are”</span>{' '}
					<span aria-hidden="true">#</span>
				</a>
			</div>
			<p>
				Virtual Coffee is, and always will be, a genuine community of people who
				value and prioritize supporting one another. We know that growth comes
				at all levels and that no matter what stage of the developer journey
				you're on, you can teach and learn.
			</p>
			<p>
				Our twice-weekly live coffees with devs at all stages of the journey has
				grown into an online community that mentors, creates educational
				content, and provides a safe community at no cost. Since our first
				coffee in April 2020, we've added a lively slack, a site, Lunch &amp;
				Learn talks, an Interview Series, a Hacktoberfest Initiative, and
				Lightning Talks.
			</p>
			<p>
				Virtual Coffee is focused on being a positive and supporting place.
				We’re here to cheer you on when you land a job, get a promotion, or
				write your first blog post.
			</p>
			<hr />
			<div className="header-anchor-wrapper header-anchor-wrapper-h2">
				<h2 id="our-mission" tabindex="-1">
					Our Mission
				</h2>
				<a className="header-anchor" href="#our-mission">
					<span className="sr-only">Permalink to “Our Mission”</span>{' '}
					<span aria-hidden="true">#</span>
				</a>
			</div>
			<p>
				Virtual Coffee's mission is to be a welcoming tech community that allows
				room for growth and mentorship at all levels, and to create meaningful
				opportunities for learning, leadership, and contribution for everyone.
			</p>
			<div className="header-anchor-wrapper header-anchor-wrapper-h2">
				<h2 id="our-vision" tabindex="-1">
					Our Vision
				</h2>
				<a className="header-anchor" href="#our-vision">
					<span className="sr-only">Permalink to “Our Vision”</span>{' '}
					<span aria-hidden="true">#</span>
				</a>
			</div>
			<p>
				We welcome and support developers at all stages to create a more
				empathetic tech community.
			</p>
			<div className="header-anchor-wrapper header-anchor-wrapper-h2">
				<h2 id="our-core-values" tabindex="-1">
					Our Core Values
				</h2>
				<a className="header-anchor" href="#our-core-values">
					<span className="sr-only">Permalink to “Our Core Values”</span>{' '}
					<span aria-hidden="true">#</span>
				</a>
			</div>
			<ul>
				<li>We use a person-first approach.</li>
				<li>We let intimacy, empathy, and respect inform our decisions.</li>
				<li>We create and support positive and inclusive community.</li>
				<li>We work to remove tech barriers.</li>
				<li>
					We believe everyone has the ability to teach and learn, and that
					collaboration of developers at all stages enriches our community.
				</li>
				<li>
					We meet people where they are, make space for everyone, and encourage
					the exchange and explorations of new ideas to create close
					relationships.
				</li>
				<li>
					We believe in a growth-mindset and encourage and create meaningful
					opportunities for learning and mentorship, creating a closer community
					through participation, leadership, and contributions.
				</li>
				<li>
					We value synchronous communication and events as a medium that
					encourages all of the above and enriches the asynchronous experiences.
				</li>
			</ul>
			<hr />
			<div className="header-anchor-wrapper header-anchor-wrapper-h3">
				<h3 id="becoming-a-member" tabindex="-1">
					Becoming a Member
				</h3>
				<a className="header-anchor" href="#becoming-a-member">
					<span className="sr-only">Permalink to “Becoming a Member”</span>{' '}
					<span aria-hidden="true">#</span>
				</a>
			</div>
			<p>
				To become a member of Virtual Coffee, all you need to do is{' '}
				<a href="/events">attend a Tuesday or Thursday Coffee</a> and submit the
				form you'll receive at coffee. We absolutely love the closeness of this
				community and know it’s one of the many things that sets us apart. This
				closeness starts with those coffees.
			</p>
			<p>
				You can find out more about our community and what we offer in our{' '}
				<a href="/resources/virtual-coffee">Member Resources section</a>.
			</p>
		</DefaultLayout>
	);
}
