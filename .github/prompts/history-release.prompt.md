---
agent: agent
---
Define the task to achieve, including specific requirements, constraints, and success criteria.

Model: GPT-5.2-Codex

## Implemented Goals (History Page)
- History page with left-side release list, showing week ranges sorted newest-first.
- Excludes current week from history list.
- Release captains filter (substring match) to narrow history entries.
- Release details panel (week range, generatedAt, release captains).
- Release Dashboard info panel with coordinator roster link loaded from history JSON.
- Displays CR details (ticket link, scheduled release link, change type, MTP requirement).
- Displays Release Readiness ticket info.
- Task status columns (Not Started / In Progress / Done) for the selected release.
- Loading overlay for history page with optional dev-only delay via `VITE_LOADING_DELAY_MS`.

## Pending Goal (Next)

## Focus
If this prompt is used, focus only on implementing the pending goal and do not rework already implemented features.