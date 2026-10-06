# Greptile maintainer notes

Dashboard settings that live outside this folder and fail silently when wrong:

- Who Greptile answers is set in the dashboard's Organization → Permissions.
- "Trigger reviews by authoring" must stay "Everyone (including non-members)".

`config.json` holds the review rules; `files.json` points reviews at the ADRs and docs. A new ADR gets a `files.json` entry — `docs/agents/domain.md`.
