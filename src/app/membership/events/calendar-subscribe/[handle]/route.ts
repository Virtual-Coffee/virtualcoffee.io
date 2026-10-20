// Craft-era ICS subscribe URLs are still polled by members' calendar apps (#1579).
export const dynamicParams = false;

export function generateStaticParams() {
	return ['coffees', 'virtualCoffeeEvents', 'lunchAndLearns'].map((handle) => ({
		handle,
	}));
}

export function GET() {
	return new Response(
		'This calendar feed has been retired. See https://virtualcoffee.io/events',
		{
			status: 410,
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'cache-control': 'public, max-age=3600',
				'netlify-cdn-cache-control': 'public, s-maxage=86400, durable',
			},
		},
	);
}
