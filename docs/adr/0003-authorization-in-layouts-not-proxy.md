# Authorization lives in server components, not in proxy.ts

## Context

Next.js 16 renamed `middleware.ts` to `proxy.ts`, and its own documentation
says Proxy "should not be used as a full session management or authorization
solution" — it is for optimistic checks only. Better Auth's Next.js
documentation still shows the older `middleware.ts` pattern, so a reader
following the library's guide would reasonably move the check there.

## Decision

`/admin` is gated in `src/app/admin/(protected)/layout.tsx`, which calls
`requireSession()` (`src/lib/access/adminAccess.ts`) and redirects; `proxy.ts`
carries no authorization. The layout establishes authentication only. Each page
under `/admin` calls `requirePermission()` for its Section (`docs/adr/0006`),
and every server action checks its required Permission itself rather than
trusting the route it was reached from.

## Consequences

- A page or action with no check of its own is reachable by every signed-in
  role; the layout does not save it.
- A new `proxy.ts` is for redirects and headers, not sessions.
