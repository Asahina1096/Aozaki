# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aozaki is a modern ServerStatus-Rust frontend monitoring dashboard built with Astro, React, TailwindCSS, and shadcn/ui-like components. It displays real-time server/node status with charts, card grids, and theme customization.

## Tech Stack

- **Astro 6** — Static site generation with React islands for interactivity
- **React 19** — Component framework with `client:only="react"` for all interactive UI
- **TailwindCSS v4** — Utility-first CSS with `@tailwindcss/vite` plugin
- **Recharts** — Chart library for CPU, RAM, network, GPU metrics
- **TanStack Virtual** — Window-based virtualization for large node lists (threshold: 48 nodes)
- **i18next** — Internationalization supporting en-US, zh-CN, zh-TW, ja-JP, id-ID
- **Radix UI** — Unstyled component primitives (Switch, SegmentedControl)
- **RPC2 (JSON-RPC 2.0)** — WebSocket with HTTP fallback for real-time data

## Common Commands

```bash
bun run dev          # Start development server
bun run build        # Production build
bun run preview      # Preview production build
bun run check        # TypeScript type checking (astro check)
bun run check:all    # Full check: type check + format check
bun run format       # Format code with oxfmt
bun run format:check # Check formatting without modifying
bun run clean        # Remove dist, .astro, caches, zip files
bun run package      # Build and package theme (requires preview.png, komari-theme.json)
```

**Package manager**: bun (bun@1.3.11 in packageManager field)

## Architecture

### Provider Stack (inside AppProviders)

Context providers are nested in this order (outer to inner):
1. `PublicInfoProvider` — Site title, theme settings from `/api/public`
2. `RPC2Provider` — JSON-RPC 2.0 client (WebSocket + HTTP fallback)
3. `NodeListProvider` — Node registry fetched via `common:getNodeList`
4. `LiveDataProvider` — Real-time status polling via `common:getNodesLatestStatus` every 2s
5. `AppRouter` — React Router for `/` (server list) and `/instance/:uuid` (detail view)

### Astro/React Boundary

- `src/pages/index.astro` renders the page shell with `<AppProviders client:only="react" />`
- All interactive UI (server list, charts, detail views) is React
- `BaseLayout.astro` contains an inline `<script is:inline>` that initializes the theme system before first paint to prevent FOUC

### RPC2 Communication

- `RPC2Client` in `src/lib/rpc2.ts` manages WebSocket connections with automatic HTTP fallback
- When WebSocket is connected: uses `callViaWebSocket`
- On WebSocket failure: falls back to `callViaHTTP`
- Heartbeat enabled every 15s; auto-reconnect up to 5 attempts

### API Proxy (Vite Dev Server)

The vite dev server proxies to `VITE_API_TARGET` (default: `http://127.0.0.1:25774`):
- `/api` → REST endpoints
- `/api/rpc2` → JSON-RPC 2.0 endpoint
- `/themes` → Theme assets

### Theme System

`BaseLayout.astro` inline script handles:
- Light/dark/system theme detection and persistence (`localStorage: "appearance"`)
- Background images (with blur overlay) and videos
- Card blur effects (backdrop-filter) and card opacity
- `color-scheme` CSS property sync
- Reads theme settings from `/api/public` response

### Virtualization

`ServerList.tsx` uses `@tanstack/react-virtual` window virtualization when node count >= 48. Below that threshold, a simple CSS grid is used.

## Key File Locations

- `src/components/AppProviders.tsx` — Provider composition root
- `src/components/AppRouter.tsx` — React Router setup
- `src/components/ServerList.tsx` — Main list view with virtualization
- `src/components/InstanceDetail.tsx` — Per-node detail view with charts
- `src/components/instance/charts/` — Recharts-based charts (CPU, RAM, GPU, Network, etc.)
- `src/contexts/` — React contexts for RPC2, NodeList, LiveData, PublicInfo
- `src/lib/rpc2.ts` — RPC2 client implementation
- `src/lib/normalizers/liveData.ts` — Data normalization for raw RPC responses
- `src/i18n/locales/` — Translation JSON files
- `src/layouts/BaseLayout.astro` — HTML shell with inline theme script
- `src/styles/globals.css` — TailwindCSS base + custom CSS properties

## Type Checking

Uses `astro check` (which runs TypeScript type checking via `@astrojs/check`). The `tsconfig.json` extends `astro/tsconfigs/strict` with custom paths alias (`@/*` → `./src/*`).
