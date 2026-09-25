# Membership data stays out of vc-data

## Context

`Virtual-Coffee/vc-data` describes itself as the single source of truth for
Virtual Coffee's data, and the podcast episodes here are a checked-in snapshot
from it. vc-data is a public repository whose value is that changes go through
PR review. Membership Applications are transactional records containing
personal data — email addresses and long-form personal writing from people who
have not consented to publication.

## Decision

Membership Applications live in Postgres and do not move to vc-data: `/join`
creates one, and `/admin` is the only place it is read. The two kinds of data
need opposite handling; that both are "data" is not a reason to colocate them.

## Consequences

- vc-data remains the home for reviewable content (podcast episodes, and
  anything like it).
- Nothing from the membership pipeline is exported to a public repository.
