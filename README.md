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
npm run start:dev
```

## Run the App
### Local (non-dev preview)
```bash
npm run start
```

### Dev (with time-travel + dev-only loading delay)
```bash
npm run start:dev
```

### Prod preview (build + preview)
```bash
npm run start:prod
```

## Environment Variables
- `VITE_LOADING_DELAY_MS=1200` (dev only): add to `.env` to simulate loading.
- `VITE_ENABLE_TIME_TRAVEL=true|false`: enable or disable the Time Travel panel.

## Scripts
- `npm run start`: local preview (non-dev)
- `npm run start:dev`: start local dev server
- `npm run start:prod`: build + preview production
- `npm run build`: typecheck + production build
- `npm run preview`: preview production build locally (requires manual build)
- `npm run lint`: run ESLint

## Notes (Windows)
If your environment blocks executing native binaries from `node_modules` (common in some enterprise setups), this project uses an npm override to replace native `esbuild` with `esbuild-wasm`.
