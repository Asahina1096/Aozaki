# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aozaki is a modern ServerStatus-Rust frontend monitoring dashboard built with Astro, React, TailwindCSS, and shadcn/ui. It displays real-time server monitoring data fetched from a ServerStatus-Rust backend API.

**Tech Stack:**
- **Astro 5.x**: Static site generator (Islands Architecture)
- **React 19**: Interactive UI components with React Compiler enabled
- **TailwindCSS 4.x**: Styling framework
- **TypeScript 5.x**: Type system
- **shadcn/ui**: UI component library
- **Bun**: Package manager (required)

## Development Commands

```bash
# Development
bun run dev              # Start dev server (http://localhost:4321)

# Building
bun run build            # Build production version
bun run preview          # Preview production build

# Quality Checks
bun run check            # Astro type check + clean cache
bun run check:all        # Run all checks (type + lint + format)
bun run biome:check      # Biome lint and format check
bun run biome:fix        # Fix Biome issues (lint + format)
bun run lint             # Biome lint only
bun run lint:fix         # Fix lint issues only
bun run format           # Format code with Biome
bun run format:check     # Check code formatting

# Cleanup
bun run clean            # Remove dist, .astro, cache, *.zip
bun run clean:all        # Clean + remove node_modules and bun.lock
```

**Note:** Always use `bun` as the package manager (specified in package.json).

## Architecture & Design Patterns

### Astro Islands Architecture

The project strictly follows Astro's Islands Architecture philosophy:

1. **Static-First Approach**: All `.astro` files render as static HTML by default
2. **Selective Hydration**: React components use `client:*` directives to enable interactivity only where needed
3. **Zero-JS Default**: No JavaScript is shipped unless explicitly requested

**Component Strategy:**
```astro
<!-- Static layout (BaseLayout.astro, no JS) -->
<BaseLayout>
  <!-- Static Astro components (no JS) -->
  <Header />
  <!-- Interactive React islands with client:load -->
  <ServerList client:load refreshInterval={5000} />
  <!-- Static footer (Astro component, no JS) -->
  <Footer />
</BaseLayout>
```

### File Organization

```
src/
├── components/          # React & Astro components
│   ├── ui/             # shadcn/ui primitives (Button, Card, etc.)
│   ├── ServerCard.tsx  # Server info card (React)
│   ├── ServerList.tsx  # Main data fetching component (React)
│   ├── ServerOverview.tsx  # Aggregated stats (React)
│   ├── Header.astro    # Static header (Astro)
│   └── Footer.astro    # Static footer (Astro)
├── layouts/            # Astro layouts (.astro)
│   └── BaseLayout.astro
├── pages/              # Astro pages (.astro)
│   └── index.astro
├── lib/                # Utilities and API
│   ├── api.ts          # ServerStatusAPI client
│   ├── types/          # TypeScript type definitions
│   │   └── serverstatus.ts
│   └── utils.ts        # Helper functions (formatBytes, etc.)
└── styles/
    └── globals.css     # Global styles + Tailwind
```

### Key Design Decisions

1. **React Compiler Enabled**: The project uses `babel-plugin-react-compiler` (configured in astro.config.mjs). This means:
   - Manual `useMemo`/`useCallback` is often unnecessary
   - The compiler auto-optimizes component re-renders
   - Pure functions should be extracted outside components when possible

2. **API Client Pattern**:
   - Singleton `ServerStatusAPI` class in `src/lib/api.ts`
   - Fetches from `/json/stats.json` endpoint
   - Uses `cache: 'no-store'` for real-time data
   - Configurable via `PUBLIC_API_URL` environment variable

3. **Type Safety**:
   - Complete type definitions in `src/lib/types/serverstatus.ts`
   - Matches ServerStatus-Rust JSON API schema
   - Use `@/*` path alias (configured in tsconfig.json)

4. **Component Patterns**:
   - **ServerList**: Main orchestrator (data fetching, auto-refresh, sorting)
   - **ServerCard**: Stateless presentation component
   - **ServerOverview**: Aggregated statistics display
   - All use TypeScript interfaces for props

## Environment Configuration

Required environment variable:

```env
# .env
PUBLIC_API_URL=https://your-serverstatus-backend.com
```

**Dev Proxy Setup**: In development, API requests to `/api` are proxied to `VITE_API_BASE_URL` (defaults to `https://lovejk.cc`). See `astro.config.mjs` lines 40-106 for WebSocket and HTTP proxy configuration.

## Common Development Tasks

### Adding New React Components

1. Create `.tsx` file in `src/components/`
2. Use TypeScript for all props interfaces
3. Import shadcn/ui components from `./ui/`
4. Use `@/*` imports for project files
5. In Astro files, add `client:load` directive when used:
   ```astro
   <YourComponent client:load someProp={value} />
   ```

### Working with Server Data

- All server data types are in `src/lib/types/serverstatus.ts`
- Key interfaces: `ServerStats`, `StatsResponse`
- Fetch via `getAPIClient().getStats()`
- Data refreshes every 5 seconds (configurable in `index.astro`)

### Modifying Styles

- Uses TailwindCSS 4.x with `@tailwindcss/vite` plugin
- Custom color scheme defined via CSS variables in `globals.css`
- Dark mode is the default (enforced in BaseLayout.astro)
- Theme persistence via localStorage (see inline script in BaseLayout.astro)

### Performance Optimizations

The project has several performance optimizations configured:

1. **Build Optimizations** (astro.config.mjs):
   - Manual chunking: React libs separated into dedicated chunk
   - Inline stylesheets enabled
   - Compressed size reporting disabled for faster builds
   - esbuild minification

2. **Vite Optimizations**:
   - Pre-bundled deps: `react`, `react-dom`
   - Reduced log level: `warn`

3. **Custom Build Plugin**:
   - Automatically removes `preview.png` from dist after build

## Deployment

Configured for Vercel deployment (see `vercel.json`):
- Build command: `bun run build`
- Output: `dist/`
- Framework: Astro

**Important**: Set `PUBLIC_API_URL` environment variable in Vercel project settings.

## Code Quality

### Biome Configuration

The project uses **Biome** (not ESLint/Prettier) for both linting and formatting:

- Configuration file: `biome.json`
- Flat config with comprehensive linting rules
- TypeScript support with strict type checking
- Astro-specific overrides for `.astro` files
- Auto-import organization enabled
- Custom rules:
  - `noExplicitAny`: warn (not error)
  - `noUnusedVariables`: warn in JS/TS, off in Astro
  - React hooks rules enabled (`useHookAtTopLevel`, `useExhaustiveDependencies`)
- Formatting:
  - Line width: 80
  - Indent: 2 spaces
  - Semicolons: always
  - Quotes: double
  - Trailing commas: ES5
  - JSX quotes: double

## Important Notes

1. **Package Manager**: Must use `bun` (defined in package.json `packageManager` field)
2. **Linting/Formatting**: Uses Biome, not ESLint/Prettier - run `bun run biome:fix` to auto-fix issues
3. **React Version**: React 19 is used; ensure compatibility when adding new libraries
4. **Path Aliases**: Use `@/*` instead of relative imports (e.g., `@/lib/api` not `../../lib/api`)
5. **Client Directives**: Never forget `client:*` on React components in `.astro` files
6. **API Dependency**: The application requires a running ServerStatus-Rust backend exposing `/json/stats.json`
7. **Islands Architecture**: Prefer Astro components for static content (see Header.astro and Footer.astro as examples), use React with `client:*` directives only for interactive components
