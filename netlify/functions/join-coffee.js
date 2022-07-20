exports.handler = async function (event, context) {
	const { code, day } = event.queryStringParameters;

	if (!code || !(day === 'tuesday' || day === 'thursday')) {
		return {
			statusCode: 401,
			body: 'Invalid request.',
		};
	}

	console.log(`Joining ${day}: ${code}`);

	// return {
	// 	statusCode: 200,
	// 	body: '',
	// };
	return {
		statusCode: 302,
		headers: {
			Location:
				day === 'tuesday'
					? process.env.ZOOM_TUESDAYS
					: process.env.ZOOM_THURSDAYS,
		},
	};
};
