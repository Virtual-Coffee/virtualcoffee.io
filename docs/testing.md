# Testing

Vitest, configured in `vitest.config.mts` (read its header comment: it defines the two projects and where the `@/` alias comes from). Tests are colocated as `*.test.ts` beside the module (`*.test.tsx` where the subject is JSX, as in `src/emails/`), run in a plain `node` environment with explicit `import { test, expect } from 'vitest'` — no globals, no jsdom, no React Testing Library. `pnpm test --project unit` is the fast loop; `pnpm test` runs both projects. The exception is `netlify/edge-functions/`, which Netlify bundles file-by-file; its tests live in `netlify/tests/`.

## What is tested, and how

- Pages are not unit-tested: an async Server Component cannot be rendered by a unit runner (Next's own guidance), so Netlify's deploy preview is what exercises rendering.
- Server actions are tested by calling them. `'use server'` is inert under Node and `db()` and `auth` are lazy, so an action that fails validation returns its `fieldErrors` without a database. `redirect()` and `notFound()` are asserted on the thrown digest with the helpers in `src/test/next.ts`. The zod schemas stay private to their action files.
- Anything that touches the database is a `*.db.test.ts` and runs in the `db` project against `@netlify/database-dev`, the PGlite engine `netlify dev` uses — no `netlify dev`, no Docker, nothing extra in CI.

## Rules of the `db` project

- **Mocks of shared modules are registered once, in `src/test/db/setup.ts`.** The project runs every file in one worker without isolation, so a file-scoped `vi.mock` is ignored whenever another file loaded that module first; ESLint rejects one. A test sets state through the knobs in `src/test/mocks/`.
- **Tests authenticate with real sessions.** `signInAs(roles, slackId)` in `src/test/session.ts` inserts a user and mints a session through Better Auth's `testUtils` plugin, and the mocked `next/headers` (`src/test/setup.ts`) hands that cookie to `getSession()`, so `requirePermission()` and `actorId()` run for real. The dev bypass is stubbed only where it is the subject (`adminAccess.db.test.ts`).
- **Idempotency is shown by calling twice.** PGlite is one session, so a race between two transactions cannot be staged.
- **A mocked sender returns a failure, never rejects** — `sendEmail`/`notifySlack` in `src/test/mocks/` follow the real functions' contract (`deliver()` never throws).
- Fixtures are in `src/test/db/fixtures.ts`.

`tsconfig.json` includes `**/*.ts`, so `pnpm typecheck` sees test files, and `@vitest/eslint-plugin`'s recommended rules apply to them (no focused or skipped tests).
