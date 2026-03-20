# AGENTS.md

Practical guidance for coding agents working in `/home/mihari/Aozaki`.

## 1) Scope and Stack
- Primary project: repository root package `aozaki`.
- Framework stack: Astro 5 + React 19 + TypeScript + TailwindCSS 4.
- Tooling: Biome 2 for lint/format, Bun as package manager/runtime.
- Output mode: static build to `dist/` (`astro build`, `output: "static"`).
- Path alias: `@/* -> ./src/*` (from `tsconfig.json`).

Quick project map:
- `src/pages/*.astro`: static page entrypoints.
- `src/components/*.tsx`: interactive React UI.
- `src/contexts/*.tsx`: shared client state/providers.
- `src/lib/*`: API, helpers, shared app logic.
- `src/types/*`: TypeScript type definitions.
- `src/styles/globals.css`: global styles and Tailwind layers.

## 2) Environment Setup
Run all commands from repo root.
```bash
bun install
cp .env.example .env
```
Required environment variable:
- `PUBLIC_API_URL`
  - Points to ServerStatus-Rust backend.
  - Use full HTTP/HTTPS URL.
  - Do not include trailing slash in production.
  - In dev, this may be left empty if using proxy rules in `astro.config.mjs`.

## 3) Build, Lint, Check, and Test Commands
### Core dev/build
```bash
bun run dev
bun run build
bun run preview
```
### Project quality gates
```bash
bun run check
bun run check:all
bun run biome:check
bun run biome:fix
bun run lint
bun run lint:fix
bun run format
bun run format:check
```
Notes:
- `bun run check` deletes `dist`, `.astro`, and cache before `astro check`.
- Prefer targeted checks while iterating; run broader checks before finishing.
### Focused single-file checks (fast path for agents)
```bash
bunx biome check src/components/ServerList.tsx
bunx biome lint src/lib/api.ts
bunx biome format --write src/components/ServerCard.tsx
```
### Test status and single-test command
Current repository status:
- No `test` script exists in root `package.json`.
- No `*.test.*` or `*.spec.*` files are currently present.
What to run today:
- Treat `bun run check` + Biome checks as required validation.
If tests are added later, use these patterns:
```bash
# Bun test runner (single test file)
bun test path/to/file.test.ts

# Vitest (single test file)
bunx vitest run path/to/file.test.ts

# Jest (single test file)
bunx jest path/to/file.test.ts

# Playwright (single spec)
bunx playwright test path/to/spec.test.ts
```

## 4) Code Style and Conventions
### Formatting baseline (Biome + EditorConfig)
- Indentation: 2 spaces.
- Line endings: LF.
- Max line width: 80.
- Semicolons: always.
- Quotes: double quotes in JS/TS/JSX.
- Trailing commas: ES5.
- Keep final newline; trim trailing spaces (except Markdown behavior in `.editorconfig`).
### Imports and modules
- Prefer `@/` imports for modules under `src`.
- Use relative imports only when they are clearly shorter and local.
- Use `import type` for type-only imports.
- Keep ESM only; CommonJS `require` is disallowed by lint rules.
- Let Biome organize imports instead of manual reordering.
### TypeScript expectations
- Project extends `astro/tsconfigs/strict`; keep code strictly typed.
- Avoid `any`; when unavoidable, constrain and narrow immediately.
- Prefer explicit interfaces/types for API payloads and context values.
- Preserve backend field names (including snake_case) at API boundaries.
- Prefer `as const`, literal unions, and discriminated unions for state maps.
### Naming and file conventions
- Components, types, interfaces, classes: `PascalCase`.
- Variables, functions, hooks: `camelCase`.
- Hook names must start with `use`.
- Constants: `UPPER_SNAKE_CASE` for module-level immutable values.
- React component files: typically `PascalCase.tsx`.
- Utility modules: typically lowercase filenames (`api.ts`, `utils.ts`).
### React/Astro architecture patterns
- Keep static page shell in `.astro` files.
- Keep interactive/stateful logic in React components/contexts.
- Follow existing provider composition patterns (`AppProviders`, context hooks).
- In effects with timers/polling, always return cleanup handlers.
- Use stable backend IDs (`uuid`, etc.) as React list keys.
### Error handling and resilience
- Wrap async network logic in `try/catch`.
- Check `response.ok` before consuming response payload.
- Surface actionable error messages; include status/context where useful.
- Re-throw errors when caller/UI must handle them.
- Handle cancellation/abort paths safely in async effects.
### Lint constraints that matter most
- No `var`; use `const` by default, `let` only when reassignment is needed.
- No dead code or unused symbols (warnings may still be enforced in CI/workflow).
- Keep hooks at top level (`useHookAtTopLevel` is enabled).
- Avoid unsafe/unreachable control flow and suspicious constructs.

## 5) Agent Workflow Expectations
1. Read nearby files first and match local conventions before editing.
2. Make the smallest safe change that solves the task.
3. Validate touched files with targeted commands, then broader checks.
4. Do not modify unrelated files or refactor outside task scope.
5. Do not overwrite user-authored changes you did not create.
6. When adding new conventions, update this file in the same PR.

Validation order for normal tasks:
1. Run single-file Biome checks for files you changed.
2. Run `bun run check` when type-level behavior might be affected.
3. Run `bun run check:all` before final handoff for larger changes.
4. If a new test runner appears, run the relevant single-test command too.

## 6) Cursor/Copilot Rule Files
Checked locations:
- `.cursor/rules/`
- `.cursorrules`
- `.github/copilot-instructions.md`
Current status:
- No Cursor/Copilot rule files were found in this repository.

If these files are added later, treat them as higher-priority instructions and
update this `AGENTS.md` accordingly.
