# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Virtual Coffee website (virtualcoffee.io) - a community platform built with Next.js 15 (App Router), deployed on Netlify. Virtual Coffee is a tech community featuring twice-weekly meetings, events, monthly challenges, newsletters, podcasts, and member profiles.

## Essential Commands

### Development

```bash
# Primary development command (builds member files + starts dev server)
pnpm dev

# Development server runs at http://localhost:9000
# Uses Netlify CLI for local development with functions
```

### Building & Testing

```bash
# Production build (same as Netlify uses)
pnpm build

# Lint JavaScript/TypeScript
pnpm lint

# Format code with Prettier
pnpm format

# Build member data files only (runs automatically before build/dev)
pnpm build-member-files
```

### Package Management

- **Required:** Node >= 22.20.0
- **Required:** pnpm (via Corepack: `corepack enable && corepack prepare`)
- This repo enforces pnpm-only via preinstall script

## Architecture Overview

### Next.js App Router Structure

The site uses Next.js 15 with the App Router pattern:

- **`src/app/`** - App Router pages and layouts
  - Route groups: `(simple-mdx)`, `(challenges)`
  - Dynamic routes: `[slug]`, `[[...slug]]` for catch-all MDX content
  - Layouts: Root layout in `src/app/layout.tsx`

### Content Management System

**MDX-based content** with frontmatter, loaded server-side:

1. **Content Sources:**
   - `src/content/members/` - Member profiles (TypeScript files, not MDX)
   - `src/content/newsletters/` - Newsletter issues
   - `src/content/resources/` - Documentation and guides
   - `src/content/simple-mdx-pages/` - Static pages

2. **Content Loading:**
   - `src/util/loadMdx.server.ts` - Core MDX loading utilities
   - Reads `.mdx` files with frontmatter (title, description, hero, tags, order)
   - Builds nested route structures with `loadMdxDirectory()`
   - Handles both file routes (`page.mdx`) and folder routes (`folder/index.mdx`)

3. **MDX Processing Pipeline (next.config.mjs):**
   - Remark plugins: custom TOC generation, frontmatter parsing
   - Rehype plugins: syntax highlighting, heading slugs, autolink headings

### Member Data System

**Critical pre-build step** managed by `scripts/loadMemberFiles.ts`:

1. Scans `src/content/members/core/*.ts` and `src/content/members/members/*.ts`
2. Generates barrel files in `src/data/members/` that export all member profiles
3. **Must run before building** (automated via `prebuild` script)

Member profiles are TypeScript objects (not MDX) stored in `src/content/members/`.

### Data Layer

**`src/data/`** - Aggregated data modules:

- `newsletters.ts` - Imports all newsletter issues
- `podcast.ts` - Podcast episode data
- `events.ts` - Event listings
- `sponsors.ts` - Sponsor information
- `monthlyChallenges/` - Challenge data by month
- `members/` - Generated member exports (built by `build-member-files`)

### Netlify Functions

**Serverless functions** in `netlify/functions/`:

- `join-coffee.js` - Handles Zoom meeting redirects (Tuesday/Thursday)
- `join-slack.js` - Slack invitation handling

Environment variables for Zoom links stored in `.env` (see `.env.example`).

### Styling

- **Tailwind CSS** for utility classes
- **Bootstrap 4.6.2** for legacy components
- **Sass** (SCSS modules) in `src/styles/`
- Sass deprecation warnings silenced in `next.config.mjs`

### TypeScript Configuration

- Path alias: `@/*` maps to `src/*`
- Strict mode enabled
- Target: ES2017

### External Data Integrations

Optional (token-gated):

- **GitHub API** - Member data, sponsors
- **CMS** - Member management system at `members.virtualcoffee.io`
- **Airtable** - Monthly challenge data, membership signup
- **imgix** - Image optimization (disabled by default locally)

See `.env.example` for required tokens.

## Common Development Patterns

### Adding a New MDX Page

1. Create `.mdx` file in appropriate `src/content/` subdirectory
2. Add frontmatter:

   ```yaml
   ---
   meta:
     title: "Page Title"
     description: "Page description"
   hero:
     Hero: "UndrawIllustrationName"
   ---
   ```

3. For nested pages, use `index.mdx` for the parent
4. Optional `order` field controls sort order in listings

### Adding a Monthly Challenge

1. Create page in `src/app/monthlychallenges/(challenges)/[month-year]/page.tsx`
2. Add data file in `src/data/monthlyChallenges/`
3. Follow existing pattern (see other challenge directories)

### Adding a Newsletter Issue

1. Create folder in `src/content/newsletters/YYYY-MM/`
2. Add TypeScript module with `handle` export
3. Import in `src/data/newsletters.ts` (alphabetically by date)

### Working with Member Data

1. Add member files to `src/content/members/members/[username].ts` (or `core/` for core team)
2. Run `pnpm build-member-files` to regenerate exports
3. Member data includes: name, bio, location, links, GitHub username

## Deployment

- **Platform:** Netlify
- **Build Command:** `pnpm build`
- **Publish Directory:** `.next`
- **Plugin:** `@netlify/plugin-nextjs`
- **Redirects:** Configured in `netlify.toml`

## Important Notes

- Do not commit `.env` file (use `.env.example` as template)
- Run `pnpm build-member-files` before building if member files changed
- Netlify dev server proxies to Next.js (port 3000 → 9000)
- Custom TOC generation happens in `next.config.mjs` (searches for "toc" headings)
- Monthly challenges may require Airtable API keys for full functionality
