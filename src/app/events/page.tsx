import DefaultLayout from '@/components/layouts/DefaultLayout';
import { getEvents } from '@/data/events';
import { getSponsors } from '@/data/sponsors';
import { createMetaData } from '@/util/createMetaData.server';
import DisplayHtml from '@/components/DisplayHtml';
import { dateForDisplay } from '@/util/date';
import Link from 'next/link';
import { Google } from '@/svg/calendar/Google';
import { Outlook } from '@/svg/calendar/Outlook';
import { Ics } from '@/svg/calendar/Ics';

// ISR: Revalidate every 12 hours
export const revalidate = 43200;

export const metadata = createMetaData({
	title: 'Virtual Coffee Community Events',
	description: 'See our upcoming events!',
	Hero: 'UndrawConferenceCall',
});

export default async function Page() {
	const [events, sponsors] = await Promise.all([
		getEvents({
			limit: 20,
		}),
		getSponsors(),
	]);

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
							Most of our events are members-only. If you&apos;d like to join
							one of these events, please consider{' '}
							<Link href="/join">joining Virtual Coffee!</Link>
						</p>
					</div>

					<hr />

					<h3>Recorded Events</h3>
					<div className="mb-3">
						<p>
							If you can&apos;t join our events live, we got you covered! You
							can find our{' '}
							<a href="https://www.youtube.com/playlist?list=PLh9uT23TA65idCyc_orC85RefgY_-fKsG">
								Lunch & Learns
							</a>
							,{' '}
							<a href="https://www.youtube.com/playlist?list=PLh9uT23TA65jcPcUKv6e7TIu9lrOwiXP0">
								Live Streams
							</a>
							,{' '}
							<a href="https://www.youtube.com/playlist?list=PLh9uT23TA65gwNgoeeZ21XWlxLOwxs3Ls">
								Lightning Talks 2022
							</a>
							, and lots more, all on our{' '}
							<a href="https://www.youtube.com/@VirtualCoffeeIO">
								YouTube channel
							</a>
							.
						</p>
					</div>

					<hr />

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
												{/* eslint-disable-next-line @next/next/no-img-element */}
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
								<Link href="/sponsorship">Sponsor Virtual Coffee</Link>
							</div>
						</div>
					)}

					{events.map((event) => (
						<div className="card mb-4" key={event.startDateLocalized}>
							<div className="card-header py-2 d-flex justify-content-between align-items-center flex-row flex-wrap">
								<time dateTime={event.startDateLocalized}>
									{`${dateForDisplay(event.startDateLocalized, 'EEEE, LLLL d, yyyy')} - ${dateForDisplay(event.startDateLocalized, 't')} to ${dateForDisplay(event.endDateLocalized, 't ZZZZ')}`}
								</time>
								<div
									className="d-flex flex-row align-items-center"
									style={{ gap: '0.5rem' }}
								>
									<small className="text-muted">Add to Calendar:</small>
									<a
										href={event.eventCalendarLinks.google}
										target="_blank"
										rel="noreferrer"
										title="Google Calendar"
									>
										<Google />
									</a>
									<a
										href={event.eventCalendarLinks.outlook}
										target="_blank"
										rel="noreferrer"
										title="Outlook Calendar"
									>
										<Outlook />
									</a>
									<a
										href={event.eventCalendarLinks.ics}
										title="Download ICS"
										download
									>
										<Ics />
									</a>
								</div>
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
