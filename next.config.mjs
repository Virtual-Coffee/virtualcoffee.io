import path from 'path';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import createMDX from '@next/mdx';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);

/**
 * Reference a local MDX plugin by absolute path, with a hash of its contents
 * mixed into the options.
 *
 * Turbopack requires serializable loader options, so these plugins are passed
 * as path strings. That makes the cache key blind to the plugin's *contents*:
 * edit a plugin and Next reuses the previously compiled MDX. That silently
 * shipped stale `.sr-only` markup after the class was renamed to
 * `.visually-hidden`. Mixing in the hash makes any edit invalidate the cache.
 * Both plugins ignore unknown options.
 */
const localMdxPlugin = (relPath, options = {}) => {
	const absPath = path.join(__dirname, relPath);
	const pluginVersion = createHash('sha1')
		.update(readFileSync(absPath))
		.digest('hex')
		.slice(0, 8);
	return [absPath, { ...options, pluginVersion }];
};

// `netlify dev --live` serves the site from a per-developer tunnel host but
// proxies to :9000, and sets `x-forwarded-host` to that local port. Next's
// Server Action CSRF check compares `origin` to the forwarded host and aborts
// on the mismatch, and its dev-resource guard blocks the tunnel the same way.
// The subdomain differs per developer (`--live=<name>`), so allow the zone
// rather than one host — in dev only; both lists are empty in every deployed
// environment. `*` matches exactly one DNS label, so `*.netlify.live` is the
// only pattern that matches `<sub>--<site>.netlify.live`.
// NETLIFY_DEV is set by the CLI for the process it spawns.
const devTunnelOrigins =
	process.env.NETLIFY_DEV === 'true' ? ['*.netlify.live'] : [];

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// `netlify dev` routes every request through the block-bots edge function
	// (netlify.toml declares it on /*), and the local Deno runtime gunzips the
	// upstream body while passing Next's `content-encoding: gzip` header through
	// untouched — the browser then fails with ERR_CONTENT_DECODING_FAILED. Netlify's
	// CDN compresses in production, so let the proxy own compression locally.
	// NETLIFY_DEV is set by the CLI for the process it spawns.
	compress: process.env.NETLIFY_DEV !== 'true',
	sassOptions: {
		includePaths: [path.join(__dirname, 'node_modules')],
		// Bootstrap 5.3's own Sass triggers if-function and global-builtin
		// deprecations on Dart Sass 1.10x. Silence warnings coming from
		// dependencies only, so warnings in src/styles/ still surface.
		quietDeps: true,
		silenceDeprecations: [
			'abs-percent',
			'color-functions',
			'color-module-compat',
			'import',
			'legacy-js-api',
		],
	},
	pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
	// Next 16 streams React's dev-only debug info (owner stacks, component
	// origins) to the browser over the `/_next/hmr` websocket, keyed by request
	// id, and the client router *blocks* the Flight decode until those chunks
	// arrive. Behind `netlify dev --live` the socket connects and the server
	// sends every chunk, but they never reach the browser, so every client-side
	// navigation suspends forever: the RSC response is a clean 200, nothing
	// throws, nothing is logged, and the page simply never changes. Defaults to
	// true; disabling it costs richer dev stack traces and nothing else. Set it
	// back to `true` if you never use the live tunnel and want them.
	experimental: {
		reactDebugChannel: false,
		serverActions: {
			allowedOrigins: devTunnelOrigins,
		},
	},
	allowedDevOrigins: devTunnelOrigins,
};

const withMDX = createMDX({
	// Plugins are referenced by path/name string so the options stay
	// serializable, which Turbopack requires. Plugins that need function
	// options live in src/mdx-plugins/. Local paths must be absolute: the
	// loader resolves relative paths from each MDX file's directory.
	options: {
		remarkPlugins: [
			localMdxPlugin('src/mdx-plugins/remark-toc.mjs', {
				tight: true,
				parents: ['root', 'mdxJsxFlowElement'],
				maxDepth: 3,
			}),
			'remark-frontmatter',
		],
		rehypePlugins: [
			'rehype-slug',
			localMdxPlugin('src/mdx-plugins/rehype-heading-anchors.mjs'),
			'rehype-highlight',
		],
	},
});

export default withMDX(nextConfig);
