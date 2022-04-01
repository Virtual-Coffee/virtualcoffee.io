const { builder } = require('@netlify/functions');
const { loadUserData } = require('../../app/data/members');
require('dotenv').config();

async function handler(event, context) {
	const userData = await loadUserData();

	return {
		statusCode: 200,
		ttl: 60 * 24 * 265, // in seconds
		body: JSON.stringify(userData),
	};
}

exports.handler = builder(handler);
