exports.handler = async function (event, context) {
	const { code } = event.queryStringParameters;

	if (!code) {
		return {
			statusCode: 401,
			body: 'Invalid request.',
		};
	}

	console.log(`Joining slack: ${code}`);

	// return {
	// 	statusCode: 200,
	// 	body: '',
	// };
	return {
		statusCode: 302,
		headers: {
			Location: process.env.SLACK_JOIN_LINK,
		},
	};
};
