# Repository Guidelines

## Project Structure & Module Organization
- `src/main.tsx` boots the React app and router; `src/routes` holds route layouts and page shells (home, workbench/settings, quick start, 404).
- Reusable UI lives in `src/components`; feature forms and widgets live in `src/views`.
- IndexedDB persistence is under `src/db` (Dexie). Shared helpers such as `cn` are in `src/lib/utils.ts`.
- Static assets stay in `public`; Vite’s entry point is `index.html`. Branding/meta defaults live in `.env.example`.

## Build, Test, and Development Commands
- `pnpm install` installs dependencies (pnpm enforced via `preinstall`).
- `pnpm dev` starts Vite with hot reload for local development.
- `pnpm build` runs TypeScript project references then builds to `dist`.
- `pnpm preview` serves the production build from `dist`.
- `pnpm lint` / `pnpm lint:fix` run ESLint + Prettier checks or auto-fixes.
- Cloudflare Pages: `pnpm cf:preview` for local Wrangler preview; `pnpm cf:deploy` publishes `dist`.

## Coding Style & Naming Conventions
- Language: TypeScript + React functional components; prefer hooks and co-locate route-specific pieces under `src/routes`.
- Styling: Tailwind-first (`src/index.css`, `tailwind.config.ts`); favor utility classes over custom CSS.
- Formatting: Prettier defaults—2-space indent, single quotes, no semicolons, trailing commas where valid.
- Naming: components PascalCase (`TaskList.tsx`), hooks `useX`, utilities camelCase; keep file names aligned with exported components.

## Testing Guidelines
- No automated test suite wired yet; manually exercise critical flows (`pnpm dev`, create task, run workbench, import/export) before submitting.
- If adding tests, colocate as `*.test.ts(x)` and prefer Vitest + React Testing Library; keep assertions deterministic.

## Commit & Pull Request Guidelines
- Commits: short, present-tense subjects with optional scopes like `ui:` or `update`; keep under ~70 characters.
- PRs should include: intent summary, key implementation notes, screenshots/GIFs for UI changes, manual test steps, and any `.env` or `dev.proxy.config.js` updates. Link related issues when available.

## Configuration & Environment
- Copy `.env.example` to `.env` and set `VITE_APP_*` values for branding/meta.
- For local proxying, copy `example.dev.proxy.config.js` to `dev.proxy.config.js` and adjust targets.
- Run `pnpm install` before development; use `pnpm preview` or `pnpm cf:preview` to validate production output.
