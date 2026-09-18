# Issue tracker: GitHub

Issues and specs for this repo are GitHub issues on `Virtual-Coffee/virtualcoffee.io`; `gh` is the client.

**PRs as a request surface: no.** External PRs are reviewed as code, not triaged as feature requests (`/triage` reads this flag).

- When a skill says "publish to the issue tracker": create a GitHub issue (`gh issue create`, heredoc for the body).
- When a skill says "fetch the relevant ticket": `gh issue view <number> --comments`.

## Wayfinding operations

Read by `/wayfinder`. The **map** is one issue labelled `wayfinder:map`; its tickets are GitHub sub-issues of the map, labelled `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`) and assigned to the driving dev once claimed.

- **Blocking** uses GitHub's native issue dependencies: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where the id is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`), not its `#number` or `node_id`. `issue_dependencies_summary.blocked_by` counts open blockers only.
- **Frontier**: the map's open children with no open blocker and no assignee; first in map order wins. **Claim**: `gh issue edit <n> --add-assignee @me`. **Resolve**: comment the answer, close, then append a pointer to the map's Decisions-so-far.
