'use client';

export default function SentryClientTest() {
	return (
		<button
			type="button"
			id="throw"
			onClick={() => {
				throw new Error('Sentry stack-trace-linking test (client) - throwaway');
			}}
		>
			throw
		</button>
	);
}
