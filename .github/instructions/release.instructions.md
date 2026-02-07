---
applyTo: '**'
---
You are working on **release-helper**, a project intended to help the **release captain** run the **weekly WRS release**.

## Project Purpose
- Make the weekly WRS release process easier to execute, more consistent, and less error-prone.
- Provide a clear, repeatable workflow and tooling support for the release captain.

## Technology Stack
- **Frontend**: React (TypeScript preferred)
- **Runtime / Tooling**: Node.js (npm or pnpm)
- **UI (optional)**: Tailwind
- **Deployment (optional)**: Add later (leave flexible: static hosting, internal portal, etc.)

## Implementation Goals (Living List)
Add/adjust goals over time. Keep items specific, testable, and scoped.

### UI-Requirements
- [ ] Project color must follow Plum and Dark Purples (color palette TBD, but should be distinct and visually appealing).
- [ ] Simple, clean interface focused on the release checklist.
- [ ] Responsive design (desktop-first, but functional on smaller screens).
- [ ] Clear status indicators for each step (e.g., Not started / In progress / Done).
- [ ] Easy way to add links/attachments to each step (e.g., PRs, dashboards, runbooks).
- [ ] Helper for drafting release notes (structure + copy-ready output).

### Must-have
- [ ] Weekly release checklist UI (create / edit / reuse templates)
- [ ] Step status tracking (Not started / In progress / Done)
- [ ] Links/attachments per step (PRs, dashboards, runbooks)
- [ ] Release notes helper (draft structure, copy-ready output)

### Nice-to-have
- [ ] Reminders & schedule view (calendar-like)
- [ ] Audit trail (who checked what, and when)
- [ ] Export formats (Markdown / text / PDF)
- [ ] Integrations (leave placeholder; decide later)

### Open Questions / Placeholders (Fill Later)
- Data persistence: ___ (localStorage / file / backend)
- Auth & access control: ___
- Source of truth for WRS release steps: ___
- Integration targets (GitHub/Jira/Slack/etc.): ___

## Coding Guidelines
- Prefer small, incremental changes; avoid unrelated refactors.
- Keep React components focused and composable; avoid oversized components.
- TypeScript-first: avoid `any` unless there is a clear reason.
- Add basic tests where practical for new logic (leave framework choice flexible for now).
- Document non-obvious behavior and operational steps in Markdown.
- If information is missing, ask for the minimal clarification needed (e.g., release steps, required outputs).