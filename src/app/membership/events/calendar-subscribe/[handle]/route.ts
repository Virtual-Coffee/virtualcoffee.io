// Craft-era ICS subscribe URLs are still polled by members' calendar apps (#1579).
// Checked here because `dynamicParams = false` does not restrict a route handler.
const retiredHandles = new Set([
	'coffees',
	'virtualCoffeeEvents',
	'lunchAndLearns',
]);

export async function GET(
	_request: Request,
	{ params }: RouteContext<'/membership/events/calendar-subscribe/[handle]'>,
) {
	const { handle } = await params;
	if (!retiredHandles.has(handle)) {
		return new Response('Not found\n', {
			status: 404,
			headers: { 'content-type': 'text/plain; charset=utf-8' },
		});
	}

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
