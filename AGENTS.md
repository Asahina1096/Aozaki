# AGENTS.md

Practical instructions for coding agents operating in `/home/mihari/Aozaki`.

## 1) Repository Scope
- Primary package: `aozaki` (repo root).
- Stack: Astro 6, React 19, TypeScript (strict), TailwindCSS 4.
- Tooling: Bun runtime/package manager, Oxfmt for formatting, Biome for linting.
- Build target: static site output in `dist/`.
- Path alias: `@/*` maps to `./src/*`.

Common folders:
- `src/pages/*.astro`: page entrypoints and static shell.
- `src/components/*.tsx`: interactive UI components.
- `src/contexts/*.tsx`: shared client state/providers.
- `src/lib/*`: helpers, API clients, shared app logic.
- `src/types/*`: TypeScript data models.
- `src/styles/globals.css`: global styles and Tailwind layers.

## 2) Environment and Setup
Run all commands from repository root.

```bash
bun install
cp .env.example .env
```

Environment variables:
- `PUBLIC_API_URL` (required by app runtime).
- Use a full `http://` or `https://` URL.
- Do not use a trailing slash in production URLs.
- Dev proxy fallback is configured in `astro.config.mjs` via `VITE_API_TARGET`.

## 3) Build, Lint, Check, and Test Commands
Core commands:

```bash
bun run dev
bun run build
bun run preview
```

Quality commands:

```bash
bun run format
bun run format:check
bun run check
bun run check:all
```

Command notes:
- `bun run check` removes `dist`, `.astro`, and cache before `astro check`.
- `bun run check:all` runs `check` then `format:check`.
- Use targeted file checks while iterating; run broader checks before handoff.

Single-file quick checks:

```bash
bunx oxfmt --write src/components/ServerList.tsx
bunx oxfmt --check src/components/ServerCard.tsx
```

Test status in this repository (current):
- No `test` script exists in `package.json`.
- No `*.test.*` or `*.spec.*` files are present.
- Validation baseline today: `bun run check` + Biome checks.

If tests are introduced later, use single-test execution patterns:

```bash
# Bun test runner (single file)
bun test path/to/file.test.ts

# Vitest (single file)
bunx vitest run path/to/file.test.ts

# Jest (single file)
bunx jest path/to/file.test.ts

# Playwright (single spec)
bunx playwright test path/to/spec.test.ts
```

## 4) Code Style and Conventions
Formatting baseline (`oxfmt` + `.editorconfig`):
- Indentation: 2 spaces.
- Line endings: LF.
- Preferred print width: 80.
- Semicolons: always.
- Quotes in JS/TS/JSX: double quotes.
- Trailing commas: ES5.
- Insert final newline; trim trailing whitespace (except Markdown).

Imports and module conventions:
- Prefer `@/` imports for modules under `src`.
- Use relative imports only when clearly shorter and local.
- Use `import type` for type-only imports.
- ESM only (`import`/`export`); avoid CommonJS `require`.
- Let Oxfmt organize imports instead of manual sorting.

TypeScript conventions:
- Keep strict typing (`extends: astro/tsconfigs/strict`).
- Avoid `any`; if unavoidable, narrow immediately and isolate scope.
- Prefer explicit interfaces/types for API payloads and context values.
- Preserve backend field names at API boundaries (including snake_case).
- Use unions/literals/`as const` for finite state values.

Naming and files:
- Components, interfaces, types, classes: `PascalCase`.
- Variables, functions, hooks: `camelCase`.
- Hook names start with `use`.
- Module constants: `UPPER_SNAKE_CASE`.
- Component files: `PascalCase.tsx`.
- Utility files: lowercase names like `api.ts`, `utils.ts`.

React/Astro patterns:
- Keep page structure/static concerns in `.astro` files.
- Keep stateful/interactive behavior in React components and contexts.
- Follow existing provider composition patterns (`AppProviders`, etc.).
- Effects with timers/polling must always clean up on unmount.
- Prefer stable backend identifiers (`uuid`) for React list keys.

Error handling and resilience:
- Wrap async network calls in `try/catch`.
- Check `response.ok` before using response payloads.
- Provide actionable error messages with context (status/operation).
- Re-throw errors when caller/UI must decide recovery.
- Handle aborted/cancelled async flows safely.

## 5) Agent Workflow Expectations
1. Read nearby files before editing; match existing patterns first.
2. Make the smallest safe change that solves the requested task.
3. Avoid unrelated refactors or cleanup not required by the task.
4. Do not overwrite user-authored changes you did not create.
5. Validate touched files with targeted checks, then broader checks.
6. If new conventions are introduced, update this file in the same PR.

Suggested validation order:
1. Run single-file Oxfmt checks on modified files.
2. Run `bun run check` when type-level behavior could be affected.
3. Run `bun run check:all` for larger or risky changes.
4. If tests exist, run the relevant single-test command and report results.

## 6) Cursor and Copilot Rule Files
Checked paths:
- `.cursor/rules/`
- `.cursorrules`
- `.github/copilot-instructions.md`

Current status:
- No Cursor or Copilot rule files were found.

If these files are added later, treat them as higher-priority instructions and
sync this `AGENTS.md` accordingly.
