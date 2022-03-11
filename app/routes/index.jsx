import VirtualCoffeeFullBanner from '~/svg/VirtualCoffeeFullBanner';
import UndrawCelebration from '~/svg/UndrawCelebration';
import getSponsors from '~/data/sponsors';
import { json, Link, useLoaderData } from 'remix';
import { getEvents } from '~/data/events';
import { dateForDisplay } from '~/utils/date';

export const loader = async () => {
	const sponsors = await getSponsors();
	const events = await getEvents({
		limit: 5,
	});
	return json({ sponsors, events });
};

export default function Index() {
	const { sponsors, events } = useLoaderData();

	return (
		<>
			<div className="hero">
				<div className="container pt-5 pb-5 pt-sm-6">
					<h1>
						<VirtualCoffeeFullBanner />
					</h1>

					<h2 className="pt-5">
						<span>An intimate community for all devs,</span>
						<span>
							optimized for{' '}
							<strong className="gradient-text-primary">you</strong>
						</span>
					</h2>
				</div>

				<div className="container pt-3 pb-5">
					<div className="bodycopy lead">
						<p>
							Virtual Coffee is a laid-back conversation with developers twice a
							week. It's the conversation that keeps going in slack. It's the
							online events that support developers at all stages of the
							journey. It's the place you go to make friends.
						</p>

						<p>
							Anyone can join! Whether you're thinking about getting into tech
							or have been in it for decades.
						</p>
					</div>
				</div>
			</div>

			<main id="maincontent">
				<div className="container-lg py-5">
					<h2 className="text-center mb-5">What we're up to</h2>
					<div className="homepageblocks">
						<div id="about" className="homepageblock-hero">
							<UndrawCelebration ariaHidden />
						</div>

						<h3 className="text-secondary homepageblock-title">
							All Things Virtual Coffee
						</h3>
						<div className="homepageblock-body">
							<p className="lead">Links and Goodies!</p>
							<ul className="postlist">
								<li className="postlist-item">
									<a className="postlist-title" href="/about/">
										About Virtual Coffee
									</a>
									<p className="postlist-description">
										Our Mission, Core Values, History, and more.
									</p>
								</li>
								<li className="postlist-item">
									<a className="postlist-title" href="/code-of-conduct/">
										Code of Conduct
									</a>
									<p className="postlist-description">
										In order to create a welcoming and inclusive community, we
										ask our members to abide by our Code of Conduct.
									</p>
								</li>
								<li className="postlist-item">
									<a className="postlist-title" href="/members/">
										Our Members
									</a>
									<p className="postlist-description">
										Meet our amazing members!
									</p>
								</li>
								<li className="postlist-item">
									<a
										className="postlist-title"
										href="https://store.virtualcoffee.io/"
									>
										Merch Store
									</a>
									<p className="postlist-description">
										Support Virtual Coffee and show your love ❤️
									</p>
								</li>
								<li className="postlist-item">
									<a
										className="postlist-title"
										href="https://github.com/Virtual-Coffee/"
									>
										VC GitHub
									</a>
									<p className="postlist-description">
										Join our Open Source efforts!
									</p>
								</li>
								<li className="postlist-item">
									<a
										className="postlist-title"
										href="https://youtube.com/c/virtualcoffeeio"
									>
										VC Videos
									</a>
									<p className="postlist-description">
										Recordings of Virtual Coffee Events and Live Streams.
									</p>
								</li>
								<li className="postlist-item">
									<a
										className="postlist-title"
										href="https://twitter.com/VirtualCoffeeIO"
									>
										VC Twitter
									</a>
									<p className="postlist-description">
										Stay up to date and join in the fun!
									</p>
								</li>
							</ul>
						</div>

						<div id="about" className="homepageblock-hero">
							<UndrawCelebration ariaHidden />
						</div>

						<h3 className="text-secondary homepageblock-title">
							<Link to="/events">Community Events</Link>
						</h3>

						<div className="homepageblock-body">
							<p className="lead">See our upcoming events!</p>
							<ul className="postlist">
								{events.map((event) => (
									<li key={event.startDateLocalized} className="postlist-item">
										<div>{event.title}</div>
										<p className="postlist-description">
											<strong>
												{dateForDisplay(event.startDateLocalized)}
											</strong>
										</p>
									</li>
								))}
							</ul>
						</div>

						{/* {% for pageBlock in collections.homePageBlocksLarge %}
    <div className="homepageblock-hero">
      {{svg(src=pageBlock.data.hero, ariaHidden=true)}}
    </div>

    <h3 className="text-secondary homepageblock-title">
      <a href="{{pageBlock.url}}">{{pageBlock.data.homePageBlocks.key}}</a>
    </h3>
    <div className="homepageblock-body">
      <p className="lead">{{pageBlock.data.description}}</p>
      {% if pageBlock.data.homePageBlocks.collectionKey %} {% displayPostList
      collections[(pageBlock.data.homePageBlocks.collectionKey)] | reverse |
      head(5) %} {% elseif pageBlock.fileSlug == 'events' %} {# Special
      handling for events TODO: find a better way to deal with this #}
      <ul className="postlist">
        {% for event in events | head(5) %}
        <li className="postlist-item">
          {{event.title}}
          <p className="postlist-description">
            <strong>{{ event.startDateLocalized | dateForDisplay }}</strong>
          </p>
        </li>
        {% endfor %}
      </ul>
      {% endif %} {% if pageBlock.data.homePageBlocks.linkText %} {% set
      linkText = pageBlock.data.homePageBlocks.linkText %} {% else %} {% set
      linkText = "See more " + pageBlock.data.homePageBlocks.key %} {% endif
      %}
      <p className="homepageblock-body-foot text-muted font-italic">
        <a href="{{pageBlock.url}}">{{linkText}}</a>
      </p>
    </div>
    {% if loop.index % 2 == 1 and not loop.last %}
  </div>
  <div className="homepageblocks">{% endif %} {% endfor %}</div> */}
					</div>
				</div>
				<div className="bg-light">
					<div className="container-lg py-5">
						<h2 className="mb-4">Our Supporters</h2>

						<p className="lead">
							We are eternally grateful to our amazing supporters and sponsors!
						</p>

						<p className="lead">
							If you'd like to support Virtual Coffee, please visit{' '}
							<a href="https://github.com/sponsors/Virtual-Coffee">
								our sponsorship page
							</a>{' '}
							on GitHub.
						</p>

						<ul className="sponsors">
							{sponsors.logoSponsors.map((tier) =>
								tier.sponsors.map((supporter) => (
									<li key={supporter.id} data-id={supporter.id}>
										<a href={supporter.websiteUrl || supporter.url}>
											<img
												src={supporter.avatarUrl_80}
												alt=""
												width="240"
												height="240"
												loading="lazy"
												decoding="async"
												sizes="(min-width: 915px) 240px, 24vw"
												srcSet={`
              ${supporter.avatarUrl_80}   80w,
              ${supporter.avatarUrl_160} 160w,
              ${supporter.avatarUrl_240} 240w,
              ${supporter.avatarUrl_480} 480w,
              ${supporter.avatarUrl_720} 720w`}
											/>
											<div className="sponsors-body">
												<h3 className="h4">{supporter.name}</h3>
												{supporter.descriptionHTML && (
													<div
														dangerouslySetInnerHTML={{
															__html: supporter.descriptionHTML,
														}}
													/>
												)}
											</div>
										</a>
									</li>
								)),
							)}
						</ul>

						<ul className="supporters my-6">
							{sponsors.supporters.map((tier) =>
								tier.sponsors.map((supporter) => (
									<li
										className={`supporters-${tier.monthlyPriceInCents}`}
										key={supporter.id}
									>
										<a
											href={supporter.url}
											title={supporter.name || supporter.login}
										>
											<img
												src={supporter.avatarUrl_80}
												alt={supporter.name || supporter.login}
												width="80"
												height="80"
												loading="lazy"
												decoding="async"
												sizes="80px"
												srcSet={`
              ${supporter.avatarUrl_80}   80w,
              ${supporter.avatarUrl_160} 160w,
              ${supporter.avatarUrl_240} 240w
            `}
											/>
											<div className="supporters-name">
												<svg
													viewBox="0 0 130 130"
													xmlns="http://www.w3.org/2000/svg"
													fillRule="evenodd"
													clipRule="evenodd"
													strokeLinejoin="round"
													strokeMiterlimit="2"
													aria-hidden="true"
												>
													<path
														d="M 20 65 A 45 45 0 1 1 110 65 A 45 45 0 1 1 20 65"
														id="curve"
														fill="transparent"
														stroke="transparent"
													/>
													<text width="500">
														<textPath xlinkHref="#curve">
															✨{supporter.name || supporter.login}✨
														</textPath>
													</text>
												</svg>
											</div>
										</a>
									</li>
								)),
							)}
						</ul>

						<div className="text-center">
							<h2 className="mb-5">Thank you!!</h2>

							<p>
								<a
									href="https://github.com/sponsors/Virtual-Coffee"
									className="btn btn-primary btn-lg"
								>
									Sponsor Virtual Coffee
								</a>
							</p>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
