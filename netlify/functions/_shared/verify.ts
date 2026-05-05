import crypto from 'node:crypto';

/**
 * Core HMAC-SHA256 verification. Computes `v0=HMAC(secret, message)` and
 * performs a timing-safe comparison against the expected signature.
 */
export function verifyHmacSignature(
	secret: string,
	message: string,
	expectedSignature: string,
): boolean {
	const computed =
		'v0=' +
		crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex');

	if (computed.length !== expectedSignature.length) {
		return false;
	}

	return crypto.timingSafeEqual(
		Buffer.from(computed, 'utf8'),
		Buffer.from(expectedSignature, 'utf8'),
	);
}

/**
 * Verifies a Slack request signature. Checks timestamp staleness (>300s)
 * then validates the HMAC signature.
 */
export function verifySlackRequest(
	rawBody: string,
	headers: Headers,
	secret: string,
): { valid: true } | { valid: false; reason: string } {
	const slackSignature = headers.get('x-slack-signature');
	const timestamp = headers.get('x-slack-request-timestamp');

	const time = Math.floor(Date.now() / 1000);
	if (!timestamp || Math.abs(time - Number(timestamp)) > 300) {
		return { valid: false, reason: 'Ignore this request.' };
	}

	const message = `v0:${timestamp}:${rawBody}`;

	if (slackSignature && verifyHmacSignature(secret, message, slackSignature)) {
		return { valid: true };
	}

	return { valid: false, reason: 'Verification Failed.' };
}

/**
 * Verifies a Zoom webhook signature using the x-zm-signature header.
 */
export function verifyZoomSignature(
	rawBody: string,
	headers: Headers,
	secret: string,
): boolean {
	const zmSignature = headers.get('x-zm-signature');
	const zmTimestamp = headers.get('x-zm-request-timestamp');

	if (!zmSignature || !zmTimestamp) {
		return false;
	}

	const message = `v0:${zmTimestamp}:${rawBody}`;
	return verifyHmacSignature(secret, message, zmSignature);
}

/**
 * Computes an HMAC-SHA256 hex digest. Used for Zoom's endpoint URL
 * validation challenge response.
 */
export function hmacSha256Hex(secret: string, data: string): string {
	return crypto.createHmac('sha256', secret).update(data).digest('hex');
}
