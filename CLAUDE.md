# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aozaki is a modern ServerStatus-Rust frontend monitoring dashboard built with Astro, React 19, TailwindCSS 4, and shadcn/ui. It's a static site that fetches server statistics from a ServerStatus-Rust backend API and displays them in real-time.

**Package Manager**: Bun 1.3.2 (enforced via packageManager field in package.json)

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

## Environment Variables

Required:

- `PUBLIC_API_URL` - ServerStatus-Rust backend URL (e.g., https://status.example.com)
  - Must be a valid HTTP or HTTPS URL (validated at runtime)
  - Must NOT end with a trailing slash
  - If not configured or invalid, application will throw clear error message
  - See `.env.example` for template

## Architecture

### Hybrid Rendering Strategy

- **Static components** (Astro): Header, Footer, BaseLayout - rendered at build time
- **Interactive components** (React): ServerList, ServerCard, ServerOverview, VirtualizedServerGrid - hydrated client-side
- Hydration strategy: `client:idle` for ServerList (hydrates when browser is idle)
- React components use React 19 with babel-plugin-react-compiler for automatic optimization (no need for manual useCallback/useMemo except critical cases like expensive sorting)

### Data Flow

1. `ServerList.tsx` uses `usePollingStats` Hook to manage data fetching and polling
2. `usePollingStats` Hook (`src/lib/hooks.ts`) handles:
   - Initial data loading from ServerStatus-Rust API via `getAPIClient()`
   - Automatic polling with configurable refresh interval
   - Page visibility and window focus tracking for smart pause/resume
   - AbortController management for request cancellation
   - Error handling and retry logic
3. API client (`src/lib/api.ts`) handles requests with timeout (10s default) and abort signal support
4. Data conforms to `StatsResponse` type from `src/lib/types/serverstatus.ts`
5. `ServerList` receives data from Hook and passes to `ServerOverview` (statistics) and `VirtualizedServerGrid` (virtualized server grid)
6. **Smart polling control**: Pauses refresh when tab is hidden OR window loses focus
   - Tracks both page visibility (`visibilitychange`) and window focus (`focus`/`blur`)
   - Only polls when both `visible` AND `focused` to minimize background resource usage
   - Smart resume: On recovery, immediately fetches if last request was >2× refresh interval ago, otherwise waits for normal polling cycle
   - Prevents excessive requests during frequent tab switching

### State Management

- `ServerList` uses React 19's `useOptimistic` hook for smooth UI updates during data refreshes
- `usePollingStats` Hook encapsulates all data fetching and polling logic:
  - Internal `useAbortController` for AbortController lifecycle management with automatic cleanup
  - Tracks page visibility and focus state for intelligent polling control
  - Uses `useRef` for `statsRef` and `lastFetchTimeRef` to enable smart resume logic
  - Returns `{ stats, loading, error, isRetrying, retry }` for component consumption
- Server sorting uses `useMemo` for performance optimization (online first, then by weight descending)
- React Compiler automatically optimizes most function references and derived state

### API Configuration

- Backend URL configured via `PUBLIC_API_URL` environment variable
- API endpoint: `/json/stats.json`
- Client caching: Singleton pattern per baseUrl in `getAPIClient()`
- Requests use `cache: "no-store"` to ensure fresh data

### Performance Optimizations

- **Virtualized server grid**: Uses `@tanstack/react-virtual` for efficient rendering of large server lists
  - Window-based virtualization (scrolls entire page, not container)
  - Responsive column layout (1/2/3/4 columns based on viewport width: <768px/768px/1024px/1280px)
  - Dynamic row height measurement (except Firefox which uses estimated height)
  - Dynamic scrollMargin recalculation on window resize for accurate positioning
  - Debounced resize handler (150ms) to avoid excessive recalculations
  - Overscan of 3 rows for smooth scrolling
- **Page Visibility API + Window Focus tracking**:
  - Auto-pause polling when tab is hidden OR window loses focus
  - Smart resume logic: immediately fetch if idle >2× refresh interval, else wait for next polling cycle
  - Prevents wasteful requests when browser is in background or user switches tabs frequently
  - Saves bandwidth and reduces server load during extended idle periods
- **Sorting optimization**: `useMemo` caches server sorting to avoid unnecessary recalculation
- **React 19 preconnect**: Uses `preconnect()` and `prefetchDNS()` to reduce API request latency
- **Custom hooks**: Reusable `useAbortController` hook eliminates code duplication for request cancellation
- **Smooth transitions**: Progress bars and hover effects use optimized CSS transitions
- **React chunk splitting**: Manual chunks in Vite config separate React runtime from app code
- **Viewport-based prefetching**: Astro prefetch strategy set to "viewport" for on-demand loading
- **Inline stylesheets**: Set to "auto" for optimal delivery based on size
- **Custom Astro integration**: Removes unused files (preview.png, etc.) from dist after build
- **esbuild minification**: Fast minification with optimized chunk naming for better caching

## Code Style

### Biome Configuration

- **Formatter**: 2 spaces, 80 char line width, LF endings, double quotes
- **Linter**: Strict rules with `noExplicitAny` as error (warn in JS/TS files for flexibility)
- **TypeScript**: `noUnusedVariables` is error, `useExhaustiveDependencies` disabled (React Compiler handles deps)
- **Astro files**: `noUnusedVariables` disabled for frontmatter to avoid false positives
- **JavaScript globals**: Common browser and Node.js globals pre-configured in biome.json

### Import Aliases

Use `@/` for src imports (e.g., `import { ServerList } from "@/components/ServerList"`)

### React Patterns

- Use React 19 features: `useOptimistic`, `preconnect()`, `prefetchDNS()`
- React Compiler is enabled - avoid manual `useCallback`/`useMemo` except for critical performance cases (e.g., expensive sorting operations)
- Server keys use `server.name` (unique identifier per ServerStatus-Rust spec)
- Dev environment validates name uniqueness to prevent React key warnings
- Custom Hooks in `src/lib/hooks.ts`:
  - `useAbortController` - Reusable pattern for request cancellation
  - `usePollingStats` - Encapsulated data fetching with smart polling, visibility tracking, and auto-pause/resume
- Use `useRef` pattern to avoid closure traps in event handlers that need access to latest state
- Shared utilities in `src/lib/utils.ts`: `isServerOnline()` for consistency across components

## Key Files

- `src/lib/api.ts` - ServerStatusAPI client with singleton pattern, abort signal support, and URL validation
- `src/lib/hooks.ts` - Custom React hooks:
  - `useAbortController` - AbortController lifecycle management for request cancellation
  - `usePollingStats` - Smart polling with visibility tracking, auto-pause/resume, and error handling
- `src/lib/utils.ts` - Shared utilities (`isServerOnline`, formatting functions for bytes/speed/uptime/load)
- `src/lib/types/serverstatus.ts` - Complete type definitions for API responses
- `src/components/ServerList.tsx` - Main component using `usePollingStats` Hook, with optimistic updates and server sorting
- `src/components/VirtualizedServerGrid.tsx` - Virtualized grid using @tanstack/react-virtual with dynamic scrollMargin
- `astro.config.mjs` - Astro config with React integration, babel-plugin-react-compiler, and performance settings
- `src/pages/index.astro` - Main page with ServerList component
- `biome.json` - Comprehensive Biome configuration for linting and formatting
- `.env.example` - Environment variable template

## Notes

- ServerStatus-Rust expects `/json/stats.json` endpoint
- Refresh interval can be modified in `src/pages/index.astro` (default: 2000ms)
- Build output excludes preview.png automatically via custom Astro integration
- Server sorting: online servers first, then by weight (descending)
- API requests include 10-second timeout with abort signal support
- All user-facing error messages are in Chinese for UI consistency
- URL validation ensures `PUBLIC_API_URL` is valid HTTP/HTTPS at runtime
