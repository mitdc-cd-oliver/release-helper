---
agent: agent
---
Define the task to achieve, including specific requirements, constraints, and success criteria.

Model: GPT-5.2-Codex

## Implemented Goals (Current Page)
- Two-column layout with left navigation (Current/History/Announcements placeholders).
- Current Release header with Start/In Progress state tied to weekly history file existence.
- Display current week date range (Mon–Sun).
- Weekly timeline card with active window and progress visualization.
- Drag-and-drop task lists with three statuses (Not Started, In Progress, Done) plus drop highlights/animations.
- Time travel dev panel (toggle button + popover) for testing timeline logic.
- Weekly history file generation and lookup via dev API endpoints using configurable filename pattern.
- Release captains management (multiple names, modal editor, validation, persisted to history file).
- Tasks are loaded from weekly history JSON (with defaults on create) and persisted on status changes.
- Task status rules enforced: Not Started → In Progress → Done, Done locked; some tasks can return to Not Started only if no subtasks.
- Child tasks are auto-created when parent enters In Progress; parent cannot complete until all children are Done.
- Requirement modal for tasks that need extra input (CR ticket number) with configurable create link.
- Release Status card reflects task counts and completion percentage.
- Change Type selection flow for #1 with conditional subtasks, plus scheduled release link, CR ticket link, and MTP requirement capture.
- Readiness ticket flow for #2 with instruction link and required ticket number/link.
- #3 info-only instruction modal with configurable prefix and shared release coordinator roster link.
- Shared release links config for runbook, readiness guide, coordinator roster, and CR create links.
- Release Dashboard modal with CR/readiness details, change type/MTP display, scheduled release link, and quick access links.
- Notes area shows time-based reminders (UAT/KT/CAB) using current/time-travel date.

## Pending Goal (Next)

## Focus
If this prompt is used, focus only on implementing the pending goal and do not rework already implemented features.