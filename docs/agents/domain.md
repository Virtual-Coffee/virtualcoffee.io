# Domain docs

Before exploring the membership code, read `CONTEXT.md` (the glossary) and the ADRs in `docs/adr/` that touch the area.

When your output names a domain concept — in an issue title, a refactor proposal, a hypothesis, a test name — use the term as `CONTEXT.md` defines it, and none of the synonyms it lists under _Avoid_. A concept the glossary lacks is a signal: either you are inventing language the project doesn't use, or there is a real gap to note for `/domain-modeling`.

If your output contradicts an ADR, say so rather than silently overriding it:

> _Contradicts ADR-0007 (real-data previews), but worth reopening because…_

A new ADR also gets a one-line entry in `.greptile/files.json` so the code reviewer reads it.
