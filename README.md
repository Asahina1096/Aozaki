# Aozaki Theme for Komari Monitor

Aozaki is a custom frontend theme for Komari Monitor.
This repository builds static assets (`dist/`) with Astro + React, and packages
them into a distributable theme zip.

## What This Repository Contains

- A Komari Monitor theme implementation (not a backend service)
- A static frontend build pipeline
- Theme metadata (`komari-theme.json`) and preview assets (`preview.png`)
- A packaging script that creates installable zip files

## Tech Stack

- Astro 6
- React 19
- TypeScript (strict)
- TailwindCSS 4
- Bun (`bun@1.3.11`)
- oxfmt (formatting)

## Quick Start

1. Install dependencies

```bash
bun install
```

2. Configure environment

```bash
cp .env.example .env
```

Set `PUBLIC_API_URL` in `.env`:

```env
# Required at runtime
# Use full URL with protocol, without trailing slash
PUBLIC_API_URL=https://your-komari-host.example.com
```

3. Start development server

```bash
bun run dev
```

Default local URL: `http://localhost:4321`.

## Build and Package

Build static assets:

```bash
bun run build
```

Create distributable theme package:

```bash
bun run package
```

The package script will:

- Run project build
- Verify required files (`dist/`, `preview.png`, `komari-theme.json`)
- Output a zip in repository root, for example:
  `aozaki-vYY.MM.DD-<commit>.zip`

## Commands

Development:

```bash
bun run dev
bun run build
bun run preview
```

Quality:

```bash
bun run format
bun run format:check
bun run check
bun run check:all
```

Cleanup:

```bash
bun run clean
bun run clean:all
```

## Environment Notes

- `PUBLIC_API_URL` is required
- Optional dev proxy override: `VITE_API_TARGET`
- Default dev proxy target in config: `http://127.0.0.1:25774`

## Testing Status

Current project status:

- No `test` script in `package.json`
- No `*.test.*` / `*.spec.*` files under `src/`

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
│   ├── contexts/       # React providers and state
│   ├── lib/            # Shared utilities and API logic
│   ├── types/          # TypeScript models
│   └── styles/         # Global styles
├── dist/               # Build output
├── komari-theme.json   # Theme metadata
├── preview.png         # Theme preview image
└── scripts/package.sh  # Packaging script
```

## Contribution

Issues and pull requests are welcome.

Before opening a PR, run:

```bash
bun run check:all
```

## License

GPL-3.0. See `LICENSE`.
