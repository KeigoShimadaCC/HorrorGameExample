# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds the Next.js App Router source (UI components, hooks, game logic).
- `data/` contains JSON scene data used at runtime.
- `public/` stores static assets (images, fonts).
- Config lives in `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, and `tsconfig.json`.

## Build, Test, and Development Commands
- `npm run dev`: start local dev server with hot reload.
- `npm run build`: create a production build.
- `npm run start`: run the production build locally.
- `npm run lint`: run Next.js ESLint checks.

## Coding Style & Naming Conventions
- Language: TypeScript + React (Next.js App Router).
- Indentation: follow existing files (2 spaces in JSON; TypeScript uses default formatting).
- Naming: React components in `PascalCase` (e.g., `GameCanvas.tsx`), hooks in `useCamelCase` (e.g., `useGameState.ts`).
- Linting: `next lint` (ESLint with `eslint-config-next`).

## Testing Guidelines
- No automated test framework is configured yet.
- If tests are added, keep them near the feature (e.g., `app/components/__tests__/`) and document how to run them here.

## Commit & Pull Request Guidelines
- Commits: keep messages short and descriptive; current history is minimal (e.g., "Initial commit").
- PRs: include a summary, screenshots for UI changes, and link related issues if applicable.

## Security & Configuration Tips
- Do not commit secrets or local config. Use `.env` files; they are ignored by `.gitignore`.
