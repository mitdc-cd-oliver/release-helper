# release-helper

Tooling to help the **release captain** run the **weekly WRS release** with a clearer, repeatable checklist workflow.

## Tech Stack
- React + TypeScript
- Vite
- Tailwind CSS
- ESLint

## Getting Started
```bash
npm install
npm run dev
```

## Scripts
- `npm run dev`: start local dev server
- `npm run build`: typecheck + production build
- `npm run preview`: preview production build locally
- `npm run lint`: run ESLint

## Notes (Windows)
If your environment blocks executing native binaries from `node_modules` (common in some enterprise setups), this project uses an npm override to replace native `esbuild` with `esbuild-wasm`.
