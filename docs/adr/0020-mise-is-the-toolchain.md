# mise is the toolchain

## Context

Onboarding was a README list: install Node (nvm or the installer), enable
Corepack, copy `.env`, `pnpm dev`, then migrate and seed by hand. The workflows
a maintainer actually runs (codegen, the checks, the dev loop, the database
tasks) lived in one person's gitignored `mise.local.toml`, so contributors and
agents got none of them. Every checkout wanted `:9000`, so a second worktree or
an agent could not run beside the first. A member reported that native Windows
does not run the site at all; WSL does.

Most contributors change content or pages and never touch the database, and
Netlify's build image ships its own mise, older than the one we develop with,
and reads `mise.toml` on every deploy.

## Decision

- **mise is required**, locally and in CI. Node stays pinned in `.nvmrc`
  (Netlify reads it) and mise reads that file; pnpm is pinned in `mise.toml` as
  well as `packageManager`, and `src/test/toolchain.test.ts` fails if the two
  differ. `mise.lock` is committed and CI installs `--locked` through
  `jdx/mise-action`.
- **`mise run` is the one command vocabulary.** The docs, CI and Netlify call
  mise tasks. `package.json` keeps only the `dev` and `test` shims (mise, else
  `./bin/mise`), so muscle memory still works. CI flags are `usage` arguments on
  the task (`mise run knip -- --reporter github-actions`), and `pnpm install
--frozen-lockfile` stays an explicit step. Anything `:prod` stays in a
  personal `mise.local.toml`.
- **Netlify runs `mise run build:deploy`** on its own image's mise. The task
  depends on `build` and then runs `drizzle-kit migrate`, so a failed codegen or
  `next build` aborts it before any migration starts (`docs/adr/0001`). A failure
  in Netlify's Next runtime steps, which run after the command, is not covered,
  as before. To stay readable by that older mise, the base config keeps
  `min_version` soft, `mise.lock` at lockfile v2, and `netlify.toml` sets
  `MISE_ENV=""`.
- **Two config layers.** `mise.toml` holds pnpm and the tasks CI and Netlify
  run (codegen, lint, typecheck, test, knip, format, bots, build, check).
  `mise.dev.toml` holds everything local: `experimental`, `[deps]`, the
  daemons, pitchfork, usage and watchexec, and the dev, database, email and
  setup tasks. `.miserc.toml` (`env = ["dev"]`) loads it; CI and Netlify set
  `MISE_ENV=""` and never see it. Its tools lock into `mise.dev.lock`, which is
  v3 because pitchfork's forge ids need it; the test fails if `mise.lock` goes
  above v2. Usage specs parse without the `usage` CLI.
- **Setup is content-first.** `bin/setup` is idempotent and never overwrites
  `.env`. It uses a mise on `PATH`, or offers the official installer plus a
  shell-activation line (shown, appended only on a yes), or falls back to
  `bin/mise`, a generated repo-local mise whose data lives in the gitignored
  `.mise/`. The local database is an opt-in question (default no, `--yes` skips
  it), and a failure there warns instead of aborting. It does not ask about
  daemons.
- **Daemons are a maintainer's tool.** `[daemons.web]` gives each git worktree
  its own port (`WEB_PORT`, base 9000, stride 10; Next takes the port above it),
  so worktrees and agents run side by side. `mise run dev` stays the default
  and uses the same ports. The pitchfork proxy is off, so there is no
  `WEB_URL`.
- **Windows: WSL or a dev container.** Native Windows is unsupported;
  `bin/setup` is bash and sends MINGW/MSYS/Cygwin shells to WSL. There is no
  `bin/mise.cmd`. `.devcontainer/devcontainer.json` (the mise feature, then
  `bin/setup --yes`, port 9000 forwarded) covers Codespaces and VS Code.
- **No `netlify dev --live` tunnel.** It existed to forward auth, which the
  local test-user sign-in replaced.

## Consequences

- A new contributor runs `bin/setup` and gets a working site without Postgres;
  nothing is installed globally unless they say yes.
- Someone using `./bin/mise` must write `./bin/mise run …` for every command;
  the README says so once, prominently.
- Two pins for pnpm, held together by a test. A Renovate bump of one without the
  other fails `mise run test`.
- `bin/mise` pins a mise version; regenerate it with
  `mise generate install-script --write bin/mise --localize` to move it.
- A tool whose lock entries need v3 can never join `mise.toml`; it goes in
  `mise.dev.toml`.
- `experimental = true` lives in `mise.dev.toml` because daemons need it; a
  daemon that changes shape upstream breaks only the opt-in path.
- knip's mise plugin reads one file at a time, so `mise.dev.toml` repeats the
  `node_modules/.bin` path entry, and `prettier` is exempted by name.
- CI no longer caches the pnpm store through `setup-node`.
- Agents find the site's address from `mise daemons urls --json` or
  `$WEB_PORT`, never by assuming `:9000` (`docs/agents/dev-server.md`).
