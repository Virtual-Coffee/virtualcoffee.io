# Dev server

Read before starting, restarting or requesting the local site. Tasks and ports come from `mise.toml` (`docs/adr/0020`).

- **Never assume `:9000`.** A linked worktree gets its own port. Inside `mise run` or `mise x -- …` read `$WEB_PORT` (the site is `http://localhost:$WEB_PORT`; Next runs on the port above it). From outside, `mise daemons urls --json` lists each daemon's `port`.
- `mise run dev` starts the site and the codegen watcher on `$WEB_PORT`, else 9000. `mise daemons start web` runs the same server under pitchfork (pinned in `mise.toml`; run `mise daemons register` once per checkout, which `bin/setup` offers); `mise daemons stop web` ends it.
- A request to a worktree's site that fails to connect usually means the server is not running there; start it before debugging.
- Local database tasks (`db:migrate`, `db:seed`, `db:studio`) need the site running in the same checkout.
- Before finishing a change, run `mise run check` (codegen, typecheck, lint, test, knip).
- Without mise on `PATH`, `./bin/mise` is the same binary: `./bin/mise run check`.
