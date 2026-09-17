# Authorization lives in server components, not in proxy.ts

`/admin` is gated in `src/app/admin/(protected)/layout.tsx`, which calls
`requireSession()` (`src/lib/access/adminAccess.ts`) and redirects. It is deliberately
**not** gated in `proxy.ts`.

Next.js 16 renamed `middleware.ts` to `proxy.ts`, and its own documentation says
Proxy "should not be used as a full session management or authorization
solution" — it is for optimistic checks only. Better Auth's Next.js
documentation still shows the older `middleware.ts` pattern, so a reader
following the library's own guide would reasonably try to move the check there.
Don't: the layout establishes authentication only. Each page under `/admin`
calls `requirePermission()` for its section (`docs/adr/0006`), and every server
action checks its required permission independently rather than trusting the
route it was reached from.
