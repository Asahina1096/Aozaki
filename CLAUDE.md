# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aozaki is a modern ServerStatus-Rust frontend monitoring dashboard built with Astro, React 19, TailwindCSS 4, and shadcn/ui. It's a static site that fetches server statistics from a ServerStatus-Rust backend API and displays them in real-time.

## Commands

### Development

```bash
bun run dev              # Start dev server at http://localhost:4321
bun run build            # Build for production
bun run preview          # Preview production build
```

### Code Quality

```bash
bun run check            # Astro type check + clean cache
bun run check:all        # Run all checks (type + lint + format)
bun run biome:check      # Biome lint and format check
bun run biome:fix        # Auto-fix Biome issues
bun run lint             # Lint only
bun run lint:fix         # Auto-fix lint issues
bun run format           # Format code
bun run format:check     # Check code formatting
```

### Cleanup

```bash
bun run clean            # Remove dist, .astro, cache, *.zip
bun run clean:all        # Remove everything including node_modules
```

### Packaging

```bash
bun run package          # Package the build via scripts/package.sh
```

## Architecture

### Hybrid Rendering Strategy

- **Static components** (Astro): Header, Footer, BaseLayout - rendered at build time
- **Interactive components** (React): ServerList, ServerCard, ServerOverview, VirtualizedServerGrid - hydrated client-side
- Hydration strategy: `client:idle` for ServerList (hydrates when browser is idle)
- React components use React 19 with babel-plugin-react-compiler for automatic optimization (no need for manual useCallback/useMemo except critical cases like expensive sorting)

### Data Flow

1. `ServerList.tsx` fetches data from ServerStatus-Rust API via `getAPIClient()`
2. API client (`src/lib/api.ts`) handles requests with timeout and abort signal support
3. Data conforms to `StatsResponse` type from `src/lib/types/serverstatus.ts`
4. `ServerList` passes data to `ServerOverview` (statistics) and `VirtualizedServerGrid` (virtualized server grid for performance)
5. Auto-refresh controlled by `refreshInterval` prop (default: 2000ms in index.astro:19)
6. Page Visibility API pauses refresh when tab is hidden to save resources

### State Management

- `ServerList` uses React 19's `useOptimistic` hook for smooth UI updates during data refreshes
- AbortController pattern with refs for request cancellation on component unmount or re-fetch
- Server sorting uses `useMemo` for performance optimization (online first, then by weight descending)
- React Compiler automatically optimizes most function references and derived state
- Page visibility state tracked to pause/resume data fetching when tab is hidden/shown

### API Configuration

- Backend URL configured via `PUBLIC_API_URL` environment variable
- API endpoint: `/json/stats.json`
- Client caching: Singleton pattern per baseUrl in `getAPIClient()`
- Requests use `cache: "no-store"` to ensure fresh data

### Performance Optimizations

- **Virtualized server grid**: Uses `@tanstack/react-virtual` for efficient rendering of large server lists
- **Page Visibility API**: Auto-pause data refresh when tab is hidden, resume when visible
- **Sorting optimization**: `useMemo` caches server sorting to avoid unnecessary recalculation
- **React 19 preconnect**: Uses `preconnect()` and `prefetchDNS()` to reduce API request latency
- **Smooth transitions**: Progress bars and hover effects use optimized CSS transitions
- React chunk splitting (astro.config.mjs:93-95)
- Viewport-based prefetching (astro.config.mjs:74-77)
- Inline stylesheets set to "auto" (astro.config.mjs:110)
- Custom Astro integration removes unused files from dist (astro.config.mjs:16-65)
- esbuild minification and optimized chunk naming (astro.config.mjs:87-101)

## Code Style

### Biome Configuration

- **Formatter**: 2 spaces, 80 char line width, LF endings, double quotes
- **Linter**: Strict rules with `noExplicitAny` as error (warn in JS/TS files for flexibility)
- **TypeScript**: `noUnusedVariables` is error, `useExhaustiveDependencies` disabled (React Compiler handles deps)
- **Astro files**: `noUnusedVariables` disabled for frontmatter to avoid false positives
- **JavaScript globals**: Common browser and Node.js globals pre-configured (biome.json:183-194)

### Import Aliases

Use `@/` for src imports (e.g., `import { ServerList } from "@/components/ServerList"`)

### React Patterns

- Use React 19 features: `useOptimistic`, `useTransition`, `preconnect()`, `prefetchDNS()`
- React Compiler is enabled - avoid manual `useCallback`/`useMemo` except for critical performance cases (e.g., expensive sorting in ServerList.tsx:179)
- Server keys use `server.name` (unique identifier per ServerStatus-Rust spec)
- Dev environment validates name uniqueness (ServerList.tsx:159-175)
- Use AbortController with refs for cancelling async operations on unmount

## Key Files

- `src/lib/api.ts` - ServerStatusAPI client with singleton pattern and abort signal support
- `src/lib/types/serverstatus.ts` - Complete type definitions for API responses
- `src/components/ServerList.tsx` - Main data fetching component with optimistic updates and page visibility tracking
- `src/components/VirtualizedServerGrid.tsx` - Virtualized grid using @tanstack/react-virtual
- `astro.config.mjs` - Astro config with React integration, babel-plugin-react-compiler, and performance settings
- `src/pages/index.astro` - Main page with ServerList component
- `biome.json` - Comprehensive Biome configuration for linting and formatting

## Environment Variables

Required:

- `PUBLIC_API_URL` - ServerStatus-Rust backend URL (e.g., https://status.example.com)

## Notes

- Package manager: Bun 1.3.2 (enforced via packageManager field)
- ServerStatus-Rust expects `/json/stats.json` endpoint
- Refresh interval can be modified in src/pages/index.astro:19
- Build output excludes preview.png automatically via custom Astro integration
- Server sorting: online servers first, then by weight (descending)
