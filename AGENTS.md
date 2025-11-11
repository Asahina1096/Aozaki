# Repository Guidelines

## Project Structure & Module Organization
`src/components/` hosts shared React/Astro UI, `src/pages/` handles routing, `src/layouts/` stores shells, and `src/lib/` keeps API helpers plus types. Assets belong in `public/`, top-level config files govern tooling, and `dist/` is build-only output.

## Build, Test, and Development Commands
- `bun run dev`: Astro dev server with hot reload on port 4321.
- `bun run build`: production bundle into `dist/` for Vercel or static hosting.
- `bun run preview`: serve the last build locally to mirror Vercel.
- `bun run check`: clear caches, then run `astro check` for types/routes.
- `bun run check:all`: execute `check` plus Biome linting as the pre-push gate.
- `bun run biome:check` / `biome:fix`: lint + format (read-only vs. write mode).
- `bun run clean` / `clean:all`: remove build outputs and optional dependencies when debugging.

## Coding Style & Naming Conventions
Biome enforces formatting; still, prefer 2-space indentation, trailing commas in multiline literals, and PascalCase filenames for components (`ServerCard.tsx`). Hooks/utilities stay camelCase, Astro routes kebab-case (`pages/status.astro`). Keep Tailwind utility strings grouped logically and run `bun run format` before committing if your editor lacks Biome integration.

## Testing Guidelines
No Jest suite exists yet, so rely on structural checks plus manual verification. Always run `bun run check:all`, then exercise the UI via `bun run dev` pointed at a real or mocked `PUBLIC_API_URL`. When adding non-trivial calculations, isolate logic inside `src/lib/` helpers and add lightweight fixtures or notes so reviewers can reason about state transitions. Document any limitations (e.g., polling intervals) beside the code you touched.

## Commit & Pull Request Guidelines
Use the Conventional Commit prefixing pattern from the existing history (`feat:`, `refactor:`, `chore:`). Keep subject lines under 72 characters and describe the behavior change, not the file list. PRs should include: a brief summary, testing commands, linked issues, and screenshots/GIFs whenever the UI moves. Keep scope tight—split refactors away from feature work, and prefer draft PRs when configuration or copy still needs confirmation.

## Configuration & Security Tips
All runtime settings flow through `.env`; currently only `PUBLIC_API_URL` is required. Update `.env.example` whenever you add a key and never commit real endpoints. Sync any environment tweaks with `vercel.json` so preview deployments remain accurate.
