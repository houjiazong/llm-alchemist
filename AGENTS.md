# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React + TypeScript app.
- `src/components/` holds reusable UI components.
- `src/views/` contains page-level screens.
- `src/routes/` defines routing.
- `src/db/` handles IndexedDB/Dexie storage.
- `src/lib/` is shared utilities.
- `public/` stores static assets (e.g., `public/logo.svg`).
- Root configs include `vite.config.ts`, `tailwind.config.ts`, and TypeScript configs.

## Build, Test, and Development Commands
- `pnpm dev`: start the Vite dev server.
- `pnpm build`: typecheck (`tsc -b`) and build the production bundle.
- `pnpm preview`: serve the production build locally.
- `pnpm lint`: run ESLint with project rules.
- `pnpm lint:fix`: auto-fix lint and formatting issues.
- `pnpm cf:preview`: build and preview with Cloudflare Pages.
- `pnpm cf:deploy`: build and deploy to Cloudflare Pages.

## Coding Style & Naming Conventions
- TypeScript + React with Tailwind CSS; prefer functional components.
- Prettier enforces 2-space indent, single quotes, no semicolons.
- ESLint + `eslint-plugin-prettier` gate formatting in CI/dev.
- Use PascalCase for components (`src/components/FooBar.tsx`), camelCase for functions.

## Testing Guidelines
- No automated test framework is configured yet.
- Validate changes with `pnpm lint` and manual UI checks via `pnpm dev`.
- If adding tests in the future, place them under `src/` near the feature.

## Commit & Pull Request Guidelines
- Recent commits follow Conventional Commits (e.g., `feat: ...`, `fix: ...`).
- Keep commits small and descriptive; include scope if helpful (e.g., `feat(ui): ...`).
- PRs should include a clear description, linked issue (if any), and screenshots for UI changes.

## Verification
- `pnpm lint`

## Configuration & Environment
- Copy `example.dev.proxy.config.js` to `dev.proxy.config.js` for local proxying.
- Environment defaults live in `.env.example` (`VITE_APP_TITLE`, `VITE_APP_LOGO_URL`, etc.).
- `pnpm` is required (`npx only-allow pnpm` runs on install).
