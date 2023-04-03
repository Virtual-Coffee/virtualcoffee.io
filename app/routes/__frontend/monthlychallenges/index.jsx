import { json } from '@remix-run/node';
import { createMetaData } from '~/util/createMetaData.server';

export const handle = {
	meta: {
		title: 'Virtual Coffee Monthly Challenges',
		description:
			'Every month, we create a challenge for our Virtual Coffee members to complete together',
	},
	hero: {
		Hero: 'UndrawGoodTeam',
	},
};

export async function loader() {
	const {
		meta: { title, description },
		hero: { Hero },
	} = handle;
	return json({
		meta: createMetaData({ title, description, Hero }),
	});
}

export function meta({ data: { meta } = {} } = {}) {
	return meta;
}

export default function Index() {
	return (
		<div>
			<div className="bg-light py-3">
				<div className="container-xl">
					<h2 className="display-5">
						Why should members participate in the monthly challenge?
					</h2>

					<p>
						These monthly challenges provide members the opportunity to learn,
						grow, and receive support and mentorship. There will be a theme for
						each month's challenge and weekly goals for the members to work on.
						Instructions, resources, and additional help for the challenges is
						provided in the #monthly-challenge channel in slack. Along with our
						Maintainers, our Challenge Team Leads plan, organize, and facilitate
						these challenges.
					</p>
				</div>
			</div>

			<div className="bg-light py-3">
				<div className="container-xl">
					<h2 className="display-5">Who can participate?</h2>

					<p>
						These challenges are available to all Virtual Coffee members and the
						goal is to support developers of all stages in their coding journey.
						To become a member of Virtual Coffee, all you need to do is{' '}
						<a href="/events">attend a Tuesday or Thursday Coffee</a> and submit
						the form you'll receive at coffee. After you submit the form, you
						will receive an invitation to join the slack group where you can
						share your progress on the challenges and ask questions.
					</p>
				</div>
			</div>

			<div className="bg-light py-5">
				<div className="container-xl">
					<h2 className="display-5">Our challenges:</h2>
					<h3>Month of Learning</h3>

					<dl>
						<dt>Time to learn new things!</dt>
						<dd>
							The goal this challenge is to learn something new, share what we
							have learned, and gather recommendations and resources to share
							with the community. During this challenge, we work on learning new
							dev-related things. You might deep-dive into one topic, start a
							small-group that focuses on community learning, focus on a new
							topic every week, or do a little bit of everything.
						</dd>
					</dl>
					<h3>Get job ready! Resumes, Cover Letters, and Elevator Pitch</h3>

					<dl>
						<dt>
							There's never a bad time to update your job application materials.
						</dt>
						<dd>
							The goal of this challenge is to work on creating, revising, or
							updating your job packet materials and that elevator pitch that
							might get you in the door. Your resume, cover letter, and elevator
							pitch should work together to tell your story and represent where
							you are on your career journey; each piece should complement the
							others. This challenge emphasizes taking time to make sure they
							work together or to get some extra feedback on what you've worked
							on.{' '}
						</dd>
					</dl>
					<h3>Creative Community Challenge</h3>

					<dl>
						<dt>Let's make some space for the other parts of ourselves.</dt>
						<dd>
							Devs are more than just the code we write. This challenge is all
							about embracing self-expression. Give back to yourself by
							indulging in something just for fun. Share the art, music, poetry,
							sports, games, or any other hobbies that spark joy for you. We
							spend so much time grinding away on understanding things in the
							tech space. Let's make some space for the other parts of
							ourselves. In this challenge, we encourage folks to spend time
							working on things that aren't necessarily code specific, or using
							code to improve other hobbies and outlets.
						</dd>
					</dl>
					<h3>Blogging Challenge</h3>
					<dl>
						<dt>
							A Community Challenge to hit a word count goal for all our tech
							blogs.
						</dt>
						<dd>
							Based off the NaNoWriMo (National Novel Writing Month) Challenge,
							this challenge is the tech take on writing and working together
							towards the goal while posting on our own blogs.
						</dd>
					</dl>
					<h3>Hacktoberfest</h3>
					<dl>
						<dt>Participate in open source, learn, and have fun!</dt>
						<dd>
							This challenge is always run during October and was our first ever
							monthly challenge. We have three tracks: maintainers will provide
							issues labeled for Hacktoberfest, contributors will solve issues,
							and mentors will help contributors and maintainers be successful.
						</dd>
					</dl>
					<h3>Preptember</h3>
					<dl>
						<dt>Get your open source projects ready!</dt>
						<dd>
							Maintainers will be reviewing their open source repos with our
							checklist to make sure their projects are ready for Hacktoberfest
							contributions, and our contributors will be looking at their
							favorite repos, evaluating them based on the guide, and writing
							good issues as needed to fulfill the criteria.
						</dd>
					</dl>
					<h3>Healthy Habits for Happy Devs</h3>
					<dl>
						<dt>
							This month's challenge is all about nourishing our bodies, minds,
							and spirits so that we can become healthier developers.
						</dt>
						<dd>
							The goal of this challenge is to build a new habit that will make
							you a healthier dev; this can be mind and body centered (drink,
							move, read, meditate, rearrange your work station) or code
							centered (review your ReadMe, clean your code, refresh your GitHub
							repo) or both. Set the goal for yourself this month and define
							what successfully completing the challenge looks like. For
							example, could be something like: review the README in 5 of your
							projects (one every week) or run 2k twice a week.
						</dd>
					</dl>
					<h3>Build in Public</h3>
					<dl>
						<dt>
							Communicate what you're working on, show your development, and be
							confident and proud of any progress made.
						</dt>
						<dd>
							In this challenge, we're working on creating a habit of talking
							about the things we're working on, a plan for continuing progress,
							and creating a demo for the Virtal Coffee community.
						</dd>
					</dl>
					<h3>Community Kindness</h3>
					<dl>
						<dt>
							Celebrating our Community as we move into a new year of Virtual
							Coffee!
						</dt>
						<dd>
							As we work hard to make sure this community continues to be the
							special and close-knit group, this challenge encourages our
							members to celebrate one of the things that continually makes this
							community so special: Kindness. Some of the ways we see this
							include: practicing gratitude, reaching out to support other
							members, mentoring, helping, giving honest and constructive
							feedback, and continuing to make Virtual Coffee a safe and
							supportive space.
						</dd>
					</dl>
					<h3>Creating Audio/Visual content</h3>
					<dl>
						<dt>
							Create a community of knowledge sharing and access to learning
							with AV content.
						</dt>
						<dd>
							For this challenge, members present their knowledge and showcase
							your understanding by exploring video and audio mediums for
							sharing knowledge, highlighting their achievements. They might do
							that by giving lunch-and-learns, youtube videos, podcasts, or some
							other form of audio or video content they created that explores a
							coding-related concept--there's no length requirement. We believe
							this provides value by solidifying ideas, creating a resource for
							others, inviting personal growth through conversations sparked by
							sharing, and demonstrating your ability to talk through a concept.
						</dd>
					</dl>
					<h3>Pairing</h3>
					<dl>
						<dt>
							Pairing is more than just coding with someone else. Pairing is
							about communication, teaching, learning, positive reinforcements,
							and growing.
						</dt>
						<dd>
							{' '}
							For this challenge, members are challenged to hit 5 pairing
							sessions per person, limiting your pairing sessions to one
							Pomodoro session--twenty-five minute. Some ways to get started
							pairing are on an open-source issue, a LeetCode problem, or a
							project they need help on.
						</dd>
					</dl>
					<h3>Giving Meaningful and Empathetic Feedback</h3>
					<dl>
						<dt>Give and accept feedback from others.</dt>
						<dd>
							When we care about our community members, we can offer empathetic
							responses that are honest and allow them to grow and to fix a
							problem. Sometimes these conversations are hard. But sometimes we
							need hard conversations to help us grow. This challenge calls
							members to approach each other with kindness and honesty, and
							allow this kind of feedback to be a regular part of our process.
						</dd>
					</dl>
				</div>
			</div>
		</div>
	);
}
