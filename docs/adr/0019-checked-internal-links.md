# Checked internal links

## Context

`Nav.tsx`, `homePageLinks.ts`, page components and about 120 Markdown links
in `src/content` are hand-written paths, so a renamed or removed route broke
them silently. Next's `typedRoutes` turns a literal href that matches no
route into a type error, but only when no route accepts every path: the root
catch-all `(simple-mdx)/[...slug]` typed as `/${string}` and let every href
through, and `/resources/[[...slug]]` did the same under `/resources`. The
type system cannot see Markdown links at all.

## Decision

- `typedRoutes` is on, and **no route sits at the root as a catch-all**.
  `about`, `code-of-conduct` and `uses` are explicit routes sharing
  `src/util/simpleMdxPage.server.tsx`.
- `/resources` keeps its catch-all, since the handbook is a tree of MDX
  files. `pnpm codegen` writes the gitignored `ResourcePath` union from those
  files. A `/resources` href is built with `resourceHref()`, and the ESLint
  rule `vc/resource-hrefs` bans a literal one.
- The index is `resources/page.tsx` plus a required `[...slug]`, because a
  bare `/resources` is not a `Route` under an optional catch-all.
- `src/content/links.test.ts` checks every root-relative link in the MDX
  against the sitemap's pages, a short list of unlisted routes and files under
  `public/`. A `netlify.toml` redirect source fails, because a redirect is a
  hop that can be removed without the content noticing.
- `as Route` is for a URL Next does not own. The Slack join URL is the only one.

## Consequences

- A new simple page is an `.mdx` file plus a `src/app/<slug>/page.tsx` and its
  slug in `SimpleMdxSlug` (`src/util/simpleMdxPage.server.tsx`).
- A new catch-all at the root, or a wider one anywhere, switches link
  checking off for every path it matches. It is a review finding.
- Adding or moving a resource file needs `pnpm codegen` before typecheck.
- A link in content to a redirected path must be pointed at its target.
