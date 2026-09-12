# Membership data stays out of vc-data

`Virtual-Coffee/vc-data` describes itself as the single source of truth for
Virtual Coffee's data, and the podcast episodes here are a checked-in snapshot
from it. Membership Applications will **not** move there.

vc-data is a public repository whose value is that changes go through PR review.
Membership Applications are transactional records containing personal data —
email addresses and long-form personal writing from people who have not
consented to publication. The two need opposite handling, and the fact that both
are "data" is not a reason to colocate them.

vc-data remains the home for reviewable content (podcast episodes, and anything
like it). The membership pipeline lives in Postgres, reachable only through
`/admin`.
