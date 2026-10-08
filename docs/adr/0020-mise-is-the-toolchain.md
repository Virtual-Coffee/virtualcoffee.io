# mise is the toolchain

## Context

Onboarding was a README list: install Node (nvm or the installer), enable
Corepack, copy `.env`, `pnpm dev`, then migrate and seed by hand. The workflows
a maintainer actually runs (codegen, the checks, the dev loop, the database
tasks) lived in one person's gitignored `mise.local.toml`, so contributors and
agents got none of them. Every checkout wanted `:9000`, so a second worktree or
an agent could not run beside the first. A member reported that native Windows
does not run the site at all; WSL does.

## Decision

- **mise is required**, locally and in CI. Node stays pinned in `.nvmrc`
  (Netlify reads it) and mise reads that file; pnpm is pinned in `mise.toml` as
  well as `packageManager`, and `src/test/toolchain.test.ts` fails if the two
  differ. `mise.lock` is committed and CI installs `--locked` through
  `jdx/mise-action`.
- **mise owns workflows, pnpm owns primitives.** `mise.toml` holds the tasks
  (`codegen`, `check`, `dev`, `db:*`, `setup`); package.json keeps the scripts
  CI and Netlify call. `dev` is a shim for `mise run dev`, which replaces
  concurrently, npm-watch and cross-env. Anything `:prod` stays in a personal
  `mise.local.toml`.
- **Native Windows is unsupported; WSL is the answer.** `bin/setup` is bash and
  sends MINGW/MSYS/Cygwin shells to WSL. There is no `bin/mise.cmd`.
- **`bin/setup` is the one entry point.** It is idempotent and never
  overwrites `.env`. It uses a mise on `PATH`, or offers the official installer
  plus a shell-activation line (shown, appended only on a yes), or falls back to
  `bin/mise`, a generated repo-local mise whose data lives in the gitignored
  `.mise/`.
- **Daemons are opt-in and experimental.** `[daemons.web]` gives each git
  worktree its own port (`WEB_PORT`, base 9000, stride 10; Next takes the port
  above it), so worktrees and agents run side by side. pitchfork and usage are
  pinned in `mise.toml`; starting the daemon is still opt-in, and
  `mise run dev` stays the default and uses the same ports. The pitchfork proxy
  is off, so there is no `WEB_URL`.
- **No `netlify dev --live` tunnel.** It existed to forward auth, which the
  local test-user sign-in replaced.

## Consequences

- A new contributor runs `bin/setup`; there is no list of prerequisites to get
  wrong, and nothing is installed globally unless they say yes.
- Two pins for pnpm, held together by a test. A Renovate bump of one without the
  other fails `pnpm test`.
- `bin/mise` pins a mise version; regenerate it with
  `mise generate install-script --write bin/mise --localize` to move it.
- `experimental = true` is committed because daemons need it; a daemon that
  changes shape upstream breaks only the opt-in path.
- CI no longer caches the pnpm store through `setup-node`.
- Agents find the site's address from `mise daemons urls --json` or
  `$WEB_PORT`, never by assuming `:9000` (`docs/agents/dev-server.md`).
