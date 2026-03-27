# AGENTS.md

Guidance for coding agents operating in `/home/mihari/Aozaki`.

## 1) Repository Snapshot
- Project: Aozaki theme for Komari Monitor.
- Stack: Astro 6, React 19, TypeScript strict, TailwindCSS 4.
- Package manager/runtime: Bun (`bun@1.3.11`).
- Output: static assets in `dist/`, plus packaged zip via script.
- TS alias: `@/*` -> `src/*` (`tsconfig.json`).

Important paths:
- `src/pages/*.astro`: page entry points.
- `src/components/**/*.tsx`: React UI components.
- `src/contexts/**/*.tsx`: app state/providers.
- `src/lib/**`: RPC client, normalizers, helpers.
- `scripts/package.sh`: packaging pipeline.

## 2) Setup and Environment
Run from repo root:

```bash
bun install
cp .env.example .env
```

Environment:
- `PUBLIC_API_URL` is required at runtime.
- Use full URL including protocol (`http://` or `https://`).
- Prefer no trailing slash for production API URL.
- Optional local proxy override: `VITE_API_TARGET`.
- Default proxy target in `astro.config.mjs`: `http://127.0.0.1:25774`.

## 3) Build, Lint, Check, and Test Commands
Primary scripts from `package.json`:

```bash
bun run dev
bun run build
bun run preview
bun run package
```

Quality scripts:

```bash
bun run format
bun run format:check
bun run check
bun run check:all
```

What each quality command does:
- `format`: runs `oxfmt --write .`.
- `format:check`: runs `oxfmt --check .`.
- `check`: removes generated artifacts, then runs `astro check`.
- `check:all`: runs `check` and then `format:check`.

Linting status right now:
- No dedicated `lint` script in `package.json`.
- No ESLint/Biome config discovered in repository.
- Treat `bun run check:all` as the quality gate.

Testing status right now:
- No `test` script exists in `package.json`.
- No `*.test.*` or `*.spec.*` files found under `src/`.

Single test commands to use once tests exist:

```bash
bun test path/to/file.test.ts
bunx vitest run path/to/file.test.ts
bunx jest path/to/file.test.ts
bunx playwright test path/to/file.spec.ts
```

Suggested execution order for agents:
1. Run smallest relevant test file first (if tests exist).
2. Run `bun run check` when touching runtime/types/API surfaces.
3. Run `bun run check:all` before final handoff.

## 4) Code Style and Conventions
Formatting baseline (`.editorconfig` + formatter):
- UTF-8, LF, 2-space indentation.
- Always keep final newline.
- Trim trailing whitespace except in Markdown.
- Let `oxfmt` control spacing and wrapping.

Imports and module structure:
- Prefer `@/` alias for imports from `src`.
- Keep relative imports for nearby modules only.
- Use `import type` for type-only imports.
- Use ESM syntax only (`import`/`export`).
- Match existing local import grouping/order in edited files.

TypeScript expectations:
- Preserve compatibility with `astro/tsconfigs/strict`.
- Avoid `any`; prefer `unknown` + narrowing, generics, and exact types.
- Keep boundary payloads validated/normalized before app use.
- Preserve backend field names at API boundaries (snake_case is valid there).
- Use `as const` for fixed maps/constants when useful.

React/Astro architecture patterns in this repo:
- Keep page shell/layout in `.astro` files.
- Keep interactive logic in React components and contexts.
- Compose providers through `AppProviders` chain.
- Use `useMemo`/`useCallback` where identity stability matters.
- Clean up timers/listeners/subscriptions in `useEffect` cleanup.
- Avoid index keys for dynamic lists; prefer stable ids.

Naming conventions observed:
- Components/interfaces/types: `PascalCase`.
- Variables/functions/hooks: `camelCase`.
- Hooks should start with `use`.
- Constants: `UPPER_SNAKE_CASE` for true constants.

Error handling conventions:
- Wrap async RPC/fetch operations in `try/catch` when caller needs recovery.
- Check `response.ok` before parsing success payloads.
- Throw/propagate `Error` objects with clear operation context.
- Re-throw when upper layers own UX/retry decisions.
- Handle timeout/cancellation paths safely (e.g. `AbortSignal`).

State/data handling conventions:
- Normalize transport data in `src/lib/normalizers/*` before UI consumption.
- Favor immutable updates and stable object reuse where possible.
- Guard against duplicate concurrent polling/request loops.

## 5) Editing and Review Expectations
- Read nearby files before changing patterns.
- Prefer minimal, focused edits over broad refactors.
- Do not revert unrelated user changes.
- Do not add dependencies unless task requires them.
- Keep comments minimal and only for non-obvious intent.
- Preserve existing language/content style in user-facing strings.

## 6) Cursor and Copilot Rules
Searched locations:
- `.cursor/rules/`
- `.cursorrules`
- `.github/copilot-instructions.md`

Current status in this repository:
- No Cursor rule files found.
- No Copilot instructions file found.

If rule files are added later:
- Treat those files as high-priority repository instructions.
- Update this `AGENTS.md` to reflect newly added constraints.
- Resolve conflicts in favor of explicit repo rule files.
