# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aozaki is a modern ServerStatus-Rust frontend monitoring dashboard built with Astro, React 19, TailwindCSS 4, and shadcn/ui. It uses Astro's static site generation with Vercel Edge Functions for API proxying.

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

## Architecture

### Hybrid Rendering Strategy

- **Static components** (Astro): Header, Footer, BaseLayout - rendered at build time
- **Interactive components** (React): ServerList, ServerCard, ServerOverview - hydrated client-side with `client:visible`
- **API Proxy**: `/api/stats` - Vercel Edge Function (native, not through Astro adapter)
- React components use React 19 with babel-plugin-react-compiler for automatic optimization (no need for manual useCallback/useMemo except critical cases)

### Data Flow

1. `ServerList.tsx` fetches data from `/api/stats` endpoint via `getAPIClient()`
2. `/api/stats` (Vercel Edge Function) proxies requests to ServerStatus-Rust backend
3. API route implements 5-second server-side cache to reduce backend load
4. API client (`src/lib/api.ts`) handles requests with timeout and abort signal support
5. Data conforms to `StatsResponse` type from `src/lib/types/serverstatus.ts`
6. `ServerList` passes data to `ServerOverview` (statistics) and `ServerCard` (individual servers in grid layout)
7. Auto-refresh controlled by `refreshInterval` prop (default: 2000ms in index.astro:19)
8. Page Visibility API pauses refresh when tab is hidden to save resources

### State Management

- `ServerList` uses React 19's `useOptimistic` hook for smooth UI updates during data refreshes
- AbortController pattern with refs for request cancellation on component unmount or re-fetch
- Server sorting uses `useMemo` for performance optimization (online first, then by weight descending)
- React Compiler automatically optimizes most function references and derived state

### API Configuration

- **Client-side**: Fetches from `/api/stats` endpoint (no direct backend access)
- **Server-side**: Backend URL configured via `PUBLIC_API_URL` environment variable (not exposed to client bundle)
- **Caching**: 5-second server-side cache in Edge Function + Vercel CDN caching
- **Endpoint**: API route proxies to `${PUBLIC_API_URL}/json/stats.json`
- **Client caching**: Singleton pattern per endpoint in `getAPIClient()`
- **Requests**: Client uses `cache: "no-store"` to always fetch fresh data from API route

### Performance Optimizations

- **Server-side caching**: 5-second cache in Vercel Edge Function reduces backend load
- **CDN caching**: Vercel CDN caches API responses for additional performance
- **Page Visibility API**: Auto-pause data refresh when tab is hidden, resume when visible
- **Sorting optimization**: `useMemo` caches server sorting to avoid unnecessary recalculation
- **Smooth transitions**: Progress bars and hover effects use optimized CSS transitions
- **Edge Runtime**: API routes use Vercel Edge Runtime for faster cold starts and lower latency
- React chunk splitting (astro.config.mjs:98-99)
- Viewport-based prefetching (astro.config.mjs:78-81)
- Inline stylesheets set to "auto" (astro.config.mjs:114)
- Custom Astro integration removes unused files from dist (astro.config.mjs:20-69)
- esbuild minification and optimized chunk naming (astro.config.mjs:91-104)

## Code Style

### Biome Configuration

- **Formatter**: 2 spaces, 80 char line width, LF endings, double quotes
- **Linter**: Strict rules with `noExplicitAny` as error (warn in JS/TS files)
- **TypeScript**: `noUnusedVariables` is error, `useExhaustiveDependencies` disabled (React Compiler handles deps)
- **Astro files**: `noUnusedVariables` disabled for frontmatter

### Import Aliases

Use `@/` for src imports (e.g., `import { ServerList } from "@/components/ServerList"`)

### React Patterns

- Use React 19 features: `useOptimistic`, `useTransition`
- React Compiler is enabled - avoid manual `useCallback`/`useMemo` except for critical performance cases (e.g., expensive sorting)
- Server keys use `server.name` (unique identifier per ServerStatus-Rust spec)
- Dev environment validates name uniqueness (ServerList.tsx)

## Key Files

- `api/stats.ts` - Vercel Edge Function for proxying and caching backend requests
- `src/lib/api.ts` - ServerStatusAPI client with singleton pattern and abort signal support
- `src/lib/types/serverstatus.ts` - Complete type definitions for API responses
- `src/components/ServerList.tsx` - Main data fetching component with optimistic updates
- `astro.config.mjs` - Astro config with static mode, React integration, and performance settings
- `src/pages/index.astro` - Main page with ServerList component

## Environment Variables

Required:

- `PUBLIC_API_URL` - ServerStatus-Rust backend URL (e.g., https://status.example.com)
  - Used in Vercel Edge Functions and is not exposed to the client bundle
  - Configure in Vercel dashboard or `.env` file for local development

## Notes

- Package manager: Bun 1.3.2 (enforced via packageManager field)
- Astro output mode: `static` (static site generation)
- API routes: Vercel Edge Functions (native, in `api/` directory)
- Server-side cache TTL: 5 seconds (configurable in `api/stats.ts`)
- ServerStatus-Rust backend accessed via `/json/stats.json` endpoint
- Client refresh interval can be modified in src/pages/index.astro:19
- Build output excludes preview.png automatically via custom Astro integration
- Server sorting: online servers first, then by weight (descending)
