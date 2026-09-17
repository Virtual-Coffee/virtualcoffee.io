export const dynamic = 'force-dynamic';

export default function SentryServerTest() {
	throw new Error('Sentry stack-trace-linking test (server) - throwaway');
}
