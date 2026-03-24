# AGENTS.md

Operational guidance for coding agents working in `/home/mihari/Aozaki`.

## 1) Repository Overview
- Project: Aozaki theme for Komari Monitor.
- Stack: Astro 6, React 19, TypeScript (strict), TailwindCSS 4.
- Package manager and runtime: Bun (`bun@1.3.11`).
- Build target: static site output in `dist/`.
- TS path alias: `@/*` maps to `src/*`.

Key areas:
- `src/pages/*.astro`: page entrypoints and static shell.
- `src/components/**/*.tsx` and `src/contexts/**/*.tsx`: UI, routing, and provider logic.
- `src/lib/**`, `src/types/**`, `src/styles/**`: shared logic, app types, and theme styles.

## 2) Setup and Environment
Run all commands from repository root:

```bash
bun install
cp .env.example .env
```

Environment expectations:
- `PUBLIC_API_URL` is required at runtime.
- Use full URLs (`http://` or `https://`).
- Prefer no trailing slash for production URLs.
- Dev proxy target can be overridden via `VITE_API_TARGET`.
- Default proxy target in `astro.config.mjs`: `http://127.0.0.1:25774`.

## 3) Build, Check, and Test Commands
Primary scripts (`package.json`):

```bash
bun run dev
bun run build
bun run preview
bun run package
bun run clean
bun run clean:all
```

Code quality scripts:

```bash
bun run format
bun run format:check
bun run check
bun run check:all
```

How these behave:
- `format`: `oxfmt --write .`
- `format:check`: `oxfmt --check .`
- `check`: clean artifacts, then `astro check`
- `check:all`: `check`, then `format:check`

Lint status:
- No dedicated `lint` script exists.
- No Biome/ESLint config is present in repo root.
- Use `bun run check:all` as the baseline quality gate.

Test status right now:
- No `test` script exists in `package.json`.
- No `*.test.*` or `*.spec.*` files currently exist under `src/`.

Single-test commands to use once tests are added:

```bash
# Bun test runner: one test file
bun test src/foo/bar.test.ts

# Vitest: one test file
bunx vitest run src/foo/bar.test.ts

# Jest: one test file
bunx jest src/foo/bar.test.ts

# Playwright: one spec file
bunx playwright test tests/example.spec.ts
```

Agent rule for tests:
- Run the smallest relevant single test first, then `bun run check` or `bun run check:all`.

## 4) Code Style and Conventions
Formatting baseline (`.editorconfig` + formatter behavior):
- UTF-8, LF, 2-space indentation.
- Always keep a final newline.
- Trim trailing whitespace (except Markdown).
- Let formatter own spacing and line wrapping.

Imports and module rules:
- Prefer `@/` alias for imports from `src`.
- Use relative imports only when very local.
- Use `import type` for type-only symbols.
- Keep ESM syntax only (`import` / `export`).
- Follow local import ordering in touched files.

TypeScript rules:
- Keep strict typing compatible with `astro/tsconfigs/strict`.
- Avoid `any`; prefer explicit interfaces, narrow unions, and generics.
- Preserve backend field naming at boundaries (`snake_case` is valid).
- Validate unknown payloads before converting to app-level types.
- Prefer `as const` for finite constant maps when useful.

React and Astro patterns:
- Keep static structure and layout in `.astro` files.
- Keep interactivity in React components/contexts.
- Compose providers through the existing `AppProviders` chain.
- Clean up timers/listeners/subscriptions in effects.
- Use stable keys (`uuid` or backend identifiers), never array indices for dynamic lists.

Naming conventions observed in repo:
- Components, types, interfaces: `PascalCase`.
- Variables, functions, hooks: `camelCase`.
- Hooks start with `use`.
- Constants: `UPPER_SNAKE_CASE`.
- Component files are mostly `PascalCase.tsx`; preserve local folder patterns.

Error handling:
- Wrap async API/RPC operations in `try/catch` when caller needs error state.
- Check `response.ok` before treating fetch as success.
- Include operation context in thrown/logged errors.
- Re-throw when higher layers need to decide recovery/UI behavior.
- Handle cancellation/abort cases safely when `AbortSignal` is used.

## 5) Editing and Review Expectations
- Read nearby files before editing; align with existing architecture.
- Prefer minimal, scoped edits over broad refactors.
- Do not revert unrelated user changes.
- Add dependencies only when required by the task.
- Keep comments minimal and only for non-obvious intent.

Suggested validation order after edits:
1. Run targeted formatter/type checks for changed files.
2. Run `bun run check` when type or runtime surfaces changed.
3. Run `bun run check:all` before handoff when feasible.

## 6) Cursor and Copilot Rule Files
Checked rule paths:
- `.cursor/rules/`
- `.cursorrules`
- `.github/copilot-instructions.md`

Current repository status:
- No Cursor rule files found.
- No Copilot instructions file found.

If these rule files are added later:
- Treat them as high-priority repo instructions.
- Reconcile conflicts in favor of explicit repository rule files.
- Keep this `AGENTS.md` updated to mirror those rules.
