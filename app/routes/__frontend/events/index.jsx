import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import DisplayHtml from '~/components/DisplayHtml';
import { getEvents } from '~/data/events';
import { dateForDisplay } from '~/util/date';
import { createMetaData } from '~/util/createMetaData.server';
import getSponsors from '~/data/sponsors';

export async function loader() {
	const [events, sponsors] = await Promise.all([
		getEvents({
			limit: 20,
		}),
		getSponsors(),
	]);

	const meta = createMetaData({
		title: 'Virtual Coffee Community Events',
		description: 'See our upcoming events!',
		Hero: 'UndrawConferenceCall',
	});

	return json({ events, meta, sponsors });
}

export function meta({ data: { meta } = {} } = {}) {
	return meta;
}

export default function EventsIndex() {
	const { events, sponsors } = useLoaderData();
	const eventsSponsors = sponsors.logoSponsors.filter(
		(tier) => tier.monthlyPriceInDollars > 150,
	);

	return (
		<DefaultLayout
			Hero="UndrawConferenceCall"
			heroHeader="Virtual Coffee Events"
			heroSubheader="Please join us at one of our events!"
		>
			<div className="bg-light py-5">
				<div className="container-xl">
					<h2>Upcoming Events</h2>
					<div className="mb-3 lead">
						<p>
							Most of our events are members-only. If you'd like to join one of
							these events, please consider{' '}
							<Link to="/join">joining Virtual Coffee!</Link>
						</p>
					</div>

					<h2>Recorded Events</h2>
					<div className="mb-3 lead">
						<p>
							If you can't join our events live, we got you covered! Some of our
							events, such as Lunch & Learns, are recorded and uploaded to our{' '}
							<a href="https://www.youtube.com/channel/UCc0579aGEy7jTAgRglR4J0g">
								YouTube channel
							</a>
							.
						</p>
						<p>
							Please be patient if you can't find the events you're looking for.
							Our volunteers are working their best to process and upload them
							to our YouTube channel 😊. So remember to check it out!
						</p>
					</div>

					{eventsSponsors.length > 0 && (
						<div className="sponsors">
							<h3>
								<small>Virtual Coffee events are proudly sponsored by:</small>
							</h3>
							<ul className="sponsors-list">
								{eventsSponsors.map((tier) =>
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
							<div className="text-right text-muted">
								<a href="/sponsorship">Sponsor Virtual Coffee</a>
							</div>
						</div>
					)}

					{events.map((event) => (
						<div className="card mb-4" key={event.startDateLocalized}>
							<div className="card-header py-2 d-flex justify-content-between align-items-center flex-row flex-wrap">
								<time dateTime={event.startDateLocalized}>
									{dateForDisplay(event.startDateLocalized, 'EEEE, fff')}
								</time>

								<a href={event.eventCalendarLink} download>
									<small> Add to Calendar</small>
								</a>
							</div>
							<div className="card-body">
								<h5 className="card-title">{event.title}</h5>
								{event.eventCalendarDescription && (
									<DisplayHtml
										html={event.eventCalendarDescription}
										className="card-text"
									/>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</DefaultLayout>
	);
}
