# Aozaki Theme for Komari Monitor

Aozaki is a custom theme project built specifically for **Komari Monitor**.
It uses Astro + React + TypeScript + TailwindCSS to generate static frontend
assets that can be packaged and used as a Komari theme.

## What This Repository Is

- A Komari Monitor theme implementation (not a standalone backend service)
- A static frontend build pipeline that outputs `dist/`
- A theme packaging workflow with `komari-theme.json` and `preview.png`

## Tech Stack

- Astro 6
- React 19
- TypeScript (strict)
- TailwindCSS 4
- Biome 2
- Bun (`bun@1.3.11`)

## Komari Context (from Context7 docs)

According to Komari docs (`/komari-monitor/komari` on Context7):

- Komari frontend assets are built and deployed as static files
- Backend exposes real-time monitoring data via WebSocket endpoint
  `ws://<host>:25774/api/clients`
- Admin/API routes are under `/api/...`

This theme project targets that Komari ecosystem and API style.

## Quick Start (Theme Development)

1) Install dependencies

```bash
bun install
```

2) Configure environment

```bash
cp .env.example .env
```

Set `PUBLIC_API_URL` in `.env`:

```env
# Required for runtime
# Use full URL, no trailing slash
PUBLIC_API_URL=https://your-komari-host.example.com
```

3) Run local development

```bash
bun run dev
```

Visit `http://localhost:4321`.

## Build and Package Theme

Build static files:

```bash
bun run build
```

Create distributable theme package (recommended):

```bash
bun run package
```

The package script will:

- Build the project
- Verify required files (`dist/`, `preview.png`, `komari-theme.json`)
- Generate zip file in repo root, like:
  `aozaki-vYY.MM.DD-<commit>.zip`

Alternative script (legacy path):

```bash
bash build-theme.sh
```

## Theme Metadata

Theme metadata lives in `komari-theme.json`:

- `name`
- `short`
- `description`
- `version`
- `author`
- `url`
- `preview`

Before release, make sure metadata and preview path are correct.

## Install to Komari Monitor

Use one of these approaches depending on your Komari deployment setup:

1. Import or upload the generated theme zip via your Komari theme workflow
2. Or unpack theme files and deploy them to the static/theme location used by
   your Komari instance

If you maintain Komari from source, follow Komari official deployment docs for
frontend static file placement (`public/dist` flow documented in Context7).

## Commands

Development:

```bash
bun run dev
bun run build
bun run preview
```

Quality:

```bash
bun run biome:check
bun run biome:fix
bun run lint
bun run lint:fix
bun run format
bun run format:check
bun run check
bun run check:all
```

Clean:

```bash
bun run clean
bun run clean:all
```

## Testing Status

Current repository status:

- No `test` script in `package.json`
- No `*.test.*` / `*.spec.*` files yet

If tests are added later, run single files with:

```bash
bun test path/to/file.test.ts
bunx vitest run path/to/file.test.ts
bunx jest path/to/file.test.ts
bunx playwright test path/to/spec.test.ts
```

## Project Structure

```text
.
├── src/
│   ├── pages/          # Astro entry pages
│   ├── components/     # React UI components
│   ├── contexts/       # React contexts/providers
│   ├── lib/            # API and shared utilities
│   ├── types/          # TypeScript models
│   └── styles/         # Global styles
├── dist/               # Build output
├── komari-theme.json   # Theme metadata
├── preview.png         # Theme preview image
├── scripts/package.sh  # Packaging script
└── AGENTS.md           # Agent coding guidance
```

## Environment Notes

- `PUBLIC_API_URL` is required for runtime requests
- Dev proxy fallback target is `VITE_API_TARGET` in `astro.config.mjs`
- Default dev proxy target is `http://127.0.0.1:25774`

## Contribution

Issues and pull requests are welcome.

Before opening PRs, run:

```bash
bun run check:all
```

## License

GPL-3.0. See `LICENSE`.
