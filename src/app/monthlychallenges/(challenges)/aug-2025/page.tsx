import { createMetaData } from '@/util/createMetaData.server';
import Link from 'next/link';

const handle = {
	listTitle: 'August 2025: Photography Challenge',
	meta: {
		title: 'Monthly Challenge for August 2025: Photography Challenge',
		description:
			"August Challenge: As programmers, we spend all day in front of the screen. Let's get folks out and about.",
	},
	date: '2025-08-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
		<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <Link href="/monthlychallenges/fall-2025">next challenge</Link>!
			</div>

			<h1>
				<small>Monthly Challenge for August 2025:</small> Photography Challenge
			</h1>

			<p className="lead mt-3">
				This month, we encourage you to take some time away from your screen,
				get out of the house, then come back and share photographs in Slack. You
				can, of course, complete the challenge without going more than five feet
				from your car, but even better would be to get the benefit of some fresh
				air and exercise as well. So, let's do it!
			</p>

			<h2 className="mt-5">How to Participate</h2>

			<ul>
				<li>
					<strong>Plan:</strong> Choose some places to visit outside your home.
				</li>
				<li>
					<strong>Go:</strong> Visit them, and while you’re there, take
					photographs of your surroundings. Include a selfie if you want, but
					the main idea is to photograph the places you visit.
				</li>
				<li>
					<strong>Post:</strong> When you get back, post your photographs in the{' '}
					<code>#monthly-challenge</code> channel in Slack. Or you can post them
					on your phone while you’re out if you’re too impatient to wait!
				</li>
				<li>
					<strong>Browse:</strong> Admire everyone else’s photographs.
				</li>
			</ul>

			{/* <p>
				Read our{' '}
				<a href="https://dev.to/virtualcoffee/monthly-challenge-photography-4g18">
					blogpost
				</a>{' '}
				for more info and inspiration!
			</p> */}

			<p>
				<strong>
					Please always remember to abide by our{' '}
					<Link href="/code-of-conduct">Code of Conduct</Link>, which we take
					seriously.
				</strong>
			</p>
		</>
	);
}
