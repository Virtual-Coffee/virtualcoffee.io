# Authorization lives in server components, not in proxy.ts

`/admin` is gated in `src/app/admin/(protected)/layout.tsx`, which calls
`requireSession()` (`src/lib/adminAccess.ts`) and redirects. It is deliberately
**not** gated in `proxy.ts`.

Next.js 16 renamed `middleware.ts` to `proxy.ts`, and its own documentation says
Proxy "should not be used as a full session management or authorization
solution" — it is for optimistic checks only. Better Auth's Next.js
documentation still shows the older `middleware.ts` pattern, so a reader
following the library's own guide would reasonably try to move the check there.
Don't: the layout is the authorization boundary, and every server action under
`/admin` re-checks the session independently rather than trusting the route it
was reached from.
