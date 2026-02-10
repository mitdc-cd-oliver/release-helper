---
agent: agent
---
Please perform “startup load experience optimization” for this project, following the requirements below and output a brief change summary plus verification steps.

Goals
- Reduce initial bundle size and improve perceived startup loading.
- Do not change existing features or UI output.

Optimization Requirements (Aligned with prior changes)
1) Lazy loading & code splitting
- Lazy-load the History page and the dev helper/time-travel panel.
- Lazy-load non-critical modal/dialog components.
- Provide a light Suspense fallback for the History page.
- Ensure components only load within the routes/branches where they are used.

2) On-demand history data loading
- Do not eager-import history JSON at startup.
- Use on-demand loading (import.meta.glob without eager) when:
	- entering the History page,
	- selecting a specific week,
	- using the “Release Captains Filter”.
- Add caching to avoid duplicate loads; when filtering, load only missing entries.
- Keep sorting and filtering logic intact: sort by week descending and exclude the current week.

Constraints
- Keep existing behavior/interaction the same; avoid unrelated refactors.
- Must compile under TypeScript strict mode.
- Keep style consistent (purple/dark theme).

Suggested Checks
- Initial render does not load history JSON.
- History component and data load only when navigating to History.
- Modals load only when opened.
- Filtering remains functional without causing infinite loads.

Output
- Briefly list changes and files touched.
- If any env/config changes are added, explain their purpose.