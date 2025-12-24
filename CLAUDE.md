# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview
LLM Alchemist is a Vite + React + TypeScript web app for batch prompt evaluation. Tasks (prompt sets, OpenAI-compatible connection options, and Q/A results) are stored locally in the browser via IndexedDB (Dexie).

## Common commands
Package manager is **pnpm** (enforced by `preinstall`).

- Install deps: `pnpm install`
- Dev server: `pnpm dev`
- Typecheck + production build: `pnpm build` (runs `tsc -b && vite build`)
- Preview production build: `pnpm preview`
- Lint: `pnpm lint`
- Lint (auto-fix): `pnpm lint:fix`

Cloudflare Pages helpers:
- Preview CF Pages locally: `pnpm cf:preview` (builds then `wrangler pages dev ./dist`)
- Deploy CF Pages: `pnpm cf:deploy` (builds then `wrangler pages deploy ./dist`)

Tests:
- No automated test runner is configured (no `test` script in `package.json`).

## Local configuration
- Optional dev proxy: copy `example.dev.proxy.config.js` to `dev.proxy.config.js`. `vite.config.ts` loads it and wires `server.proxy` when present.
- App branding/env vars: see `.env.example` and `src/config.ts`.
- `VITE_PROXY_URL` is used to prefix outbound LLM API requests (see `src/views/Workbench/index.tsx`).

## Code architecture (big picture)
### Runtime entrypoints
- `index.html` is the Vite entry.
- `src/main.tsx` mounts the React app using `RouterProvider`.

### Routing / screen layout
- `src/routes/index.tsx` defines the `react-router-dom` route tree:
  - `/` → `App` layout + nested routes
    - index → `Home`
    - `/:taskId` → task-scoped area (`Task/Layout`) with:
      - `workbench` → `Task/Workbench`
      - `settings` → `Task/Settings`
    - `/quick-start` → `QuickStart`
  - `*` → `NotFound`

### Persistence model (IndexedDB)
- `src/db/index.ts` defines the persisted types and Dexie schema:
  - `Task`: includes `openAIOptions` and an array of `QA` entries
  - `QA`: `{ question, answer, rate, expectation..., usage, model, error, functionCalls, reasoning }`
  - `db.tasks` is the primary table

Most UI flows read/write tasks via `dexie-react-hooks` (`useLiveQuery`) and `db.tasks.update(...)`.

### Workbench: batch execution + import/export
- `src/views/Workbench/` is the core “run prompts” UI.
  - `src/views/Workbench/index.tsx`:
    - loads the current task from Dexie and keeps `qas` in component state
    - creates an OpenAI-compatible client via `@yomo/viv` when `openAIOptions` is present
    - runs selected/all prompts sequentially by calling `WorkbenchItemRef.run()`
    - supports XLSX import/export via `xlsx`

### UI components and styling
- `src/components/` and `src/components/ui/` contain reusable UI building blocks (Radix-based patterns).
- Styling uses Tailwind (`tailwind.config.ts`, `src/index.css`).
- Path alias `@` → `src` is configured in `vite.config.ts`.

## Repo-specific contributor notes
- See `AGENTS.md` for additional repository guidelines (structure, commands, formatting).
